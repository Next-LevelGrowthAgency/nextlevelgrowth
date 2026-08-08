"use client";

import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import type { SubmissionResponse } from "@/lib/api/submission-response";
import { containsSensitiveData } from "@/lib/growth-coach/sensitive-data";
import { cn } from "@/lib/utils";
import { collectAttribution } from "@/lib/attribution";
import type { BusinessGrowthReport, BusinessPath, CoachContext, CoachMessage, ResponseDepth } from "@/types";
import { CheckCircle2, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

/**
 * DRAFT — NEEDS HUMAN/LEGAL REVIEW: every consent checkbox's copy below
 * (report delivery, email/phone follow-up, marketing) is working draft
 * text, not attorney-reviewed language, same status as
 * src/app/terms/page.tsx and src/app/privacy-policy/page.tsx.
 *
 * There is deliberately no text-message/SMS consent checkbox: one existed
 * briefly with TCPA-style disclosure boilerplate, then was removed —
 * there is no texting feature (manual or automated) built or planned in
 * this codebase, so the checkbox created legal exposure (an SMS consent
 * record with nothing behind it) with no corresponding benefit. If a real
 * texting feature is ever built, re-add this consent checkbox with
 * wording matched specifically to how it's actually implemented, and
 * have it reviewed before going live — see
 * supabase/migrations/0006_remove_text_message_consent.sql.
 *
 * See src/lib/consent.ts's CONSENT_LANGUAGE_VERSION — bump it whenever
 * this copy changes.
 */
type FormValues = {
  firstName: string;
  email: string;
  businessName: string;
  cityState: string;
  websiteUrl: string;
  phone: string;
  preferredContactMethod: "" | "Email" | "Phone" | "Text";
  consentToSaveReport: boolean;
  consentToEmailFollowUp: boolean;
  consentToPhoneCall: boolean;
  consentToMarketing: boolean;
  consultationRequested: boolean;
  hpToken: string; // honeypot
};

function guessBusinessName(report: BusinessGrowthReport): string {
  const name = report.businessName ?? "";
  return name.length > 0 && name.length < 60 && !/[.?!]/.test(name) ? name : "";
}

const emptyValues = (report: BusinessGrowthReport): FormValues => ({
  firstName: "",
  email: "",
  businessName: guessBusinessName(report),
  cityState: "",
  websiteUrl: "",
  phone: "",
  preferredContactMethod: "",
  consentToSaveReport: false,
  consentToEmailFollowUp: false,
  consentToPhoneCall: false,
  consentToMarketing: false,
  consultationRequested: false,
  hpToken: "",
});

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label} {optional ? <span className="font-normal text-ink-500">(optional)</span> : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClasses = (hasError: boolean) =>
  cn(
    "w-full rounded-lg border px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600",
    hasError ? "border-red-400" : "border-ink-200"
  );

export function GrowthCoachLeadForm({
  report,
  context,
  sessionId,
  messages,
  businessPath,
  responseDepth,
  onCancel,
  onSubmitted,
}: {
  report: BusinessGrowthReport;
  context: CoachContext;
  sessionId: string;
  messages: CoachMessage[];
  businessPath: BusinessPath | null;
  responseDepth: ResponseDepth | null;
  onCancel: () => void;
  onSubmitted: (result: { planName: string; consentToContact: boolean }) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [values, setValues] = useState<FormValues>(() => emptyValues(report));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const headingId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep1(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (!values.firstName.trim()) next.firstName = "First name is required.";
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (values.websiteUrl && !/^https?:\/\/.+\..+/i.test(values.websiteUrl)) next.websiteUrl = "Enter a valid URL (starting with http:// or https://)";
    for (const field of ["businessName", "cityState", "websiteUrl", "phone"] as const) {
      if (values[field] && containsSensitiveData(values[field])) {
        next[field] = "This looks like it may contain sensitive information (like a password or ID number). Please remove it.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2(): boolean {
    if (!values.consentToSaveReport) {
      setErrors({ consentToSaveReport: "Please check this box to save and send your report. It's how we know you want it." });
      return false;
    }
    if (values.consentToPhoneCall && !values.phone.trim()) {
      setErrors({ phone: "A phone number is required to consent to a phone call." });
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit() {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/growth-coach/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          firstName: values.firstName,
          email: values.email,
          businessName: values.businessName,
          cityState: values.cityState,
          websiteUrl: values.websiteUrl,
          phone: values.phone,
          preferredContactMethod: values.preferredContactMethod || undefined,
          consentToSaveReport: values.consentToSaveReport,
          consentToEmailFollowUp: values.consentToEmailFollowUp,
          consentToPhoneCall: values.consentToPhoneCall,
          consentToMarketing: values.consentToMarketing,
          consultationRequested: values.consultationRequested,
          hpToken: values.hpToken,
          turnstileToken,
          report,
          context,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          businessPath,
          responseDepth,
          ...collectAttribution(),
        }),
      });
      const result = (await res.json().catch(() => null)) as SubmissionResponse | null;
      if (!result || !result.ok) {
        if (result?.code === "VALIDATION_ERROR" && result.fieldErrors) {
          const nextErrors: Partial<Record<keyof FormValues, string>> = {};
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) nextErrors[key as keyof FormValues] = messages[0];
          }
          setErrors(nextErrors);
          if (nextErrors.firstName || nextErrors.email || nextErrors.businessName || nextErrors.cityState || nextErrors.websiteUrl || nextErrors.phone) {
            setStep(1);
          } else if (nextErrors.consentToSaveReport) {
            setStep(2);
          }
        }
        setServerError(result?.message ?? "Something went wrong submitting this. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setSubmissionId(result.submissionId);
      setEmailSent(result.emailStatus === "sent");
      const consentToContact = values.consentToEmailFollowUp || values.consentToPhoneCall;
      onSubmitted({ planName: report.recommendedPlan.name, consentToContact });
    } catch {
      setServerError("Couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={headingId} className="fixed inset-0 z-[70] overflow-y-auto bg-ink-900/60 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full max-w-xl items-start justify-center px-4 py-10 sm:items-center">
        <div className="w-full rounded-2xl border border-ink-200 bg-white p-6 shadow-lifted sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p id={headingId} className="font-display text-lg font-semibold text-ink-900">
                Save &amp; send your report
              </p>
              <p className="mt-1 text-sm text-ink-500">Step {step} of 3</p>
            </div>
            <button type="button" onClick={onCancel} aria-label="Cancel" className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {status === "success" ? (
            <div role="status" className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-grove-600" aria-hidden="true" />
              <p className="font-medium text-ink-900">Saved. Your report has been recorded.</p>
              <p className="text-sm text-ink-500">
                {emailSent
                  ? `A copy has been sent to ${values.email}.`
                  : "Email delivery isn't fully configured yet, so no email was sent — your report is saved and visible to our team."}
              </p>
              {submissionId ? <p className="text-xs text-ink-400">Reference: {submissionId}</p> : null}
            </div>
          ) : (
            <>
              {step === 1 ? (
                <div className="mt-6 space-y-4">
                  <Field id="lead-firstName" label="First name" error={errors.firstName}>
                    <input
                      id="lead-firstName"
                      value={values.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      className={inputClasses(!!errors.firstName)}
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field id="lead-email" label="Email address" error={errors.email}>
                    <input
                      id="lead-email"
                      type="email"
                      value={values.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputClasses(!!errors.email)}
                      autoComplete="email"
                    />
                  </Field>
                  <Field id="lead-business" label="Business name" optional error={errors.businessName}>
                    <input
                      id="lead-business"
                      value={values.businessName}
                      onChange={(e) => set("businessName", e.target.value)}
                      className={inputClasses(!!errors.businessName)}
                    />
                  </Field>
                  <Field id="lead-citystate" label="City & state" optional error={errors.cityState}>
                    <input
                      id="lead-citystate"
                      value={values.cityState}
                      onChange={(e) => set("cityState", e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className={inputClasses(!!errors.cityState)}
                    />
                  </Field>
                  <Field id="lead-website" label="Website URL" optional error={errors.websiteUrl}>
                    <input
                      id="lead-website"
                      value={values.websiteUrl}
                      onChange={(e) => set("websiteUrl", e.target.value)}
                      placeholder="https://"
                      className={inputClasses(!!errors.websiteUrl)}
                    />
                  </Field>
                  <Field id="lead-phone" label="Phone" optional error={errors.phone}>
                    <input
                      id="lead-phone"
                      value={values.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={inputClasses(!!errors.phone)}
                      autoComplete="tel"
                    />
                  </Field>
                  <fieldset>
                    <legend className="text-sm font-medium text-ink-800">Preferred contact method (optional)</legend>
                    <div className="mt-1.5 flex gap-2">
                      {(["Email", "Phone", "Text"] as const).map((method) => (
                        <label
                          key={method}
                          className={cn(
                            "cursor-pointer rounded-full border border-ink-200 px-3 py-1.5 text-sm has-[:checked]:border-grove-500 has-[:checked]:bg-grove-50"
                          )}
                        >
                          <input
                            type="radio"
                            name="preferredContactMethod"
                            className="sr-only"
                            checked={values.preferredContactMethod === method}
                            onChange={() => set("preferredContactMethod", method)}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-6 space-y-4">
                  <p className="text-sm text-ink-600">
                    We use the information you provide to personalize your growth plan, respond to your request, and
                    improve our services. Please do not submit passwords, banking information, Social Security
                    numbers, or other highly sensitive information.
                  </p>

                  <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4"
                      checked={values.consentToSaveReport}
                      onChange={(e) => set("consentToSaveReport", e.target.checked)}
                    />
                    <span className="text-sm text-ink-800">
                      <span className="font-medium">Save and send me this report by email.</span> This is required to deliver
                      the report you requested.
                    </span>
                  </label>
                  {errors.consentToSaveReport ? (
                    <p role="alert" className="text-sm font-medium text-red-700">
                      {errors.consentToSaveReport}
                    </p>
                  ) : null}

                  <div>
                    <p className="text-sm font-medium text-ink-800">Optional: Next Level Growth may follow up by</p>
                    <p className="mt-0.5 text-xs text-ink-500">Each is separate and optional. You can decline both and still get your report.</p>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4"
                          checked={values.consentToEmailFollowUp}
                          onChange={(e) => set("consentToEmailFollowUp", e.target.checked)}
                        />
                        <span className="text-sm text-ink-800">
                          <span className="font-medium">Email</span> — additional follow-up beyond this report.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4"
                          checked={values.consentToPhoneCall}
                          onChange={(e) => set("consentToPhoneCall", e.target.checked)}
                        />
                        <span className="text-sm text-ink-800">
                          <span className="font-medium">Phone call</span> — requires a phone number above.
                        </span>
                      </label>
                    </div>
                    {errors.phone ? (
                      <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-ink-100 p-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4"
                      checked={values.consentToMarketing}
                      onChange={(e) => set("consentToMarketing", e.target.checked)}
                    />
                    <span className="text-sm text-ink-800">
                      <span className="font-medium">Send me occasional growth emails</span> (tips, not sales pressure). Separate
                      from the two above. You can decline this and still get your report.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-xl border border-dashed border-ink-200 p-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4"
                      checked={values.consultationRequested}
                      onChange={(e) => set("consultationRequested", e.target.checked)}
                    />
                    <span className="text-sm text-ink-800">
                      <span className="font-medium">I'd also like to request a free strategy conversation.</span> (optional)
                    </span>
                  </label>

                  {/* Honeypot — display:none (not sr-only) so autofill never reaches it; see ContactForm.tsx for the full rationale. */}
                  <input
                    type="text"
                    name="hpToken"
                    value={values.hpToken}
                    onChange={(e) => set("hpToken", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                  <TurnstileWidget onToken={setTurnstileToken} />

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (validateStep2()) setStep(3);
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-ink-100 p-4 text-sm">
                    <p className="font-medium text-ink-900">Submitting:</p>
                    <dl className="mt-2 space-y-1 text-ink-700">
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-500">Name</dt>
                        <dd>{values.firstName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-500">Email</dt>
                        <dd>{values.email}</dd>
                      </div>
                      {values.businessName ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-500">Business</dt>
                          <dd>{values.businessName}</dd>
                        </div>
                      ) : null}
                      {values.cityState ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-500">Location</dt>
                          <dd>{values.cityState}</dd>
                        </div>
                      ) : null}
                      {values.phone ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-ink-500">Phone</dt>
                          <dd>{values.phone}</dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>

                  <div className="rounded-xl border border-ink-100 p-4 text-sm">
                    <p className="font-medium text-ink-900">Purpose:</p>
                    <p className="mt-1 text-ink-600">Deliver your requested Business Growth Report, and only what you've approved below.</p>
                    <dl className="mt-3 space-y-1">
                      <div className="flex justify-between">
                        <dt>Save &amp; send report</dt>
                        <dd className="font-medium text-grove-700">Yes</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Email follow-up</dt>
                        <dd className={values.consentToEmailFollowUp ? "font-medium text-grove-700" : "text-ink-500"}>{values.consentToEmailFollowUp ? "Yes" : "No"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Phone call</dt>
                        <dd className={values.consentToPhoneCall ? "font-medium text-grove-700" : "text-ink-500"}>{values.consentToPhoneCall ? "Yes" : "No"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Marketing emails</dt>
                        <dd className={values.consentToMarketing ? "font-medium text-grove-700" : "text-ink-500"}>{values.consentToMarketing ? "Yes" : "No"}</dd>
                      </div>
                    </dl>
                  </div>

                  <p className="text-xs text-ink-500">
                    Read our{" "}
                    <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline hover:text-ink-800">
                      Privacy Policy
                    </a>
                    . Submitting does not guarantee any specific business result.
                  </p>

                  {serverError ? (
                    <p role="alert" className="text-sm font-medium text-red-700">
                      {serverError}
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button variant="secondary" onClick={() => setStep(2)}>
                      Edit
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={status === "submitting"}>
                      {status === "submitting" ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
