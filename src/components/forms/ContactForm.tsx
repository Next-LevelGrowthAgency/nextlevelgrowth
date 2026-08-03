"use client";

import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { collectAttribution } from "@/lib/attribution";
import { contactSchema } from "@/lib/contact-schema";
import type { SubmissionResponse } from "@/lib/api/submission-response";
import { useId, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message" | "phone" | "companyName", string>>;

const initialValues = { name: "", email: "", message: "", phone: "", companyName: "" };

/**
 * Lightweight contact form (separate from the multi-step Growth Audit form).
 * Posts to /api/contact and interprets the standardized SubmissionResponse
 * shape — a database/email/config failure is never shown as "you entered
 * something wrong," and field-level errors point at the exact field.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const errorSummaryId = useId();
  const firstErrorFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  function set<K extends keyof typeof initialValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (submittingRef.current) return; // prevents double-click double submission

    const form = event.currentTarget;
    const honeypot = (new FormData(form).get("hpToken") as string) || "";
    if (honeypot) return; // honeypot — silently drop, no error shown to a bot

    const clientCheck = contactSchema.safeParse({ ...values, hpToken: "" });
    if (!clientCheck.success) {
      const next: FieldErrors = {};
      for (const issue of clientCheck.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      requestAnimationFrame(() => firstErrorFieldRef.current?.focus());
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setFieldErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...clientCheck.data, turnstileToken: turnstileTokenRef.current, ...collectAttribution() }),
      });
      const result = (await res.json().catch(() => null)) as SubmissionResponse | null;

      if (!result || !result.ok) {
        if (result?.code === "VALIDATION_ERROR" && result.fieldErrors) {
          const next: FieldErrors = {};
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) next[key as keyof FieldErrors] = messages[0];
          }
          setFieldErrors(next);
          requestAnimationFrame(() => firstErrorFieldRef.current?.focus());
        } else {
          setFormError(result?.message ?? "Something went wrong sending your message. Please try again or email us directly.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
      setSubmissionId(result.submissionId);
      form.reset();
      setValues(initialValues);
    } catch {
      setStatus("error");
      setFormError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-grove-200 bg-grove-50 p-6 text-grove-800">
        <p className="font-semibold">Thanks. Your message is in.</p>
        <p className="mt-1 text-sm">We&rsquo;ll get back to you shortly.</p>
        {submissionId ? <p className="mt-2 text-xs text-grove-600">Reference: {submissionId}</p> : null}
      </div>
    );
  }

  const errorEntries = Object.entries(fieldErrors).filter(([, v]) => v);
  let firstErrorAssigned = false;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errorEntries.length > 0 ? (
        <div id={errorSummaryId} role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-1.5 list-disc pl-5">
            {errorEntries.map(([key, message]) => (
              <li key={key}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          ref={(el) => {
            if (fieldErrors.name && !firstErrorAssigned) {
              firstErrorFieldRef.current = el;
              firstErrorAssigned = true;
            }
          }}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600 aria-[invalid=true]:border-red-400"
        />
        {fieldErrors.name ? (
          <p id="name-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          ref={(el) => {
            if (fieldErrors.email && !firstErrorAssigned) {
              firstErrorFieldRef.current = el;
              firstErrorAssigned = true;
            }
          }}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600 aria-[invalid=true]:border-red-400"
        />
        {fieldErrors.email ? (
          <p id="email-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-800">
          Phone <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600 aria-[invalid=true]:border-red-400"
        />
        {fieldErrors.phone ? (
          <p id="phone-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {fieldErrors.phone}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="companyName" className="mb-1.5 block text-sm font-medium text-ink-800">
          Company name <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          autoComplete="organization"
          value={values.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-800">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          ref={(el) => {
            if (fieldErrors.message && !firstErrorAssigned) {
              firstErrorFieldRef.current = el;
              firstErrorAssigned = true;
            }
          }}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600 aria-[invalid=true]:border-red-400"
        />
        {fieldErrors.message ? (
          <p id="message-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {/*
        Honeypot — hidden from real visitors, catches basic bots that fill
        every field. Uses `hidden` (display:none) rather than a
        visually-hidden-but-rendered "sr-only" clip: fully removing it from
        layout is the standard way to keep browser autofill from ever
        populating it (autofill heuristics can and do reach sr-only-clipped
        fields, which previously caused real visitors to be silently
        misclassified as spam). tabIndex/autoComplete stay as
        defense-in-depth.
      */}
      <input type="text" name="hpToken" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <TurnstileWidget onToken={(token) => (turnstileTokenRef.current = token)} />

      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <p className="text-xs text-ink-500">Your information is only used to respond to your inquiry. We don&rsquo;t sell or share it.</p>

      <Button type="submit" disabled={status === "submitting"} aria-describedby={errorEntries.length > 0 ? errorSummaryId : undefined}>
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
