"use client";

import { Button } from "@/components/ui/Button";
import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Lightweight contact form (separate from the multi-step Growth Audit form).
 * Posts to /api/contact — see that route for the same "no secrets in
 * client code" pattern used by the Growth Audit form.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.email || !data.message) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. Please try again or email us directly.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-grove-200 bg-grove-50 p-6 text-grove-800">
        <p className="font-semibold">Thanks — your message is in.</p>
        <p className="mt-1 text-sm">We'll get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-800">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-ink-500">
        Your information is only used to respond to your inquiry. We don&rsquo;t sell or share it.
      </p>

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
