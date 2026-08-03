"use client";

import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { signupSchema } from "@/lib/auth-schemas";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Values = { fullName: string; email: string; businessName: string; password: string; confirmPassword: string };
const initialValues: Values = { fullName: "", email: "", businessName: "", password: "", confirmPassword: "" };

export function SignupForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Values] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { full_name: parsed.data.fullName, business_name: parsed.data.businessName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal`,
        },
      });
      if (error) {
        setFormError(error.message.toLowerCase().includes("already registered") ? "An account with this email already exists." : "Something went wrong creating your account. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setFormError("Couldn't reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-grove-600" aria-hidden="true" />
        <p className="font-medium text-ink-900">Check your email</p>
        <p className="text-sm text-ink-600">We sent a confirmation link to {values.email}. Click it to activate your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink-800">
          Full name
        </label>
        <input
          id="fullName"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          aria-invalid={!!errors.fullName}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
        {errors.fullName ? (
          <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.fullName}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-ink-800">
          Business name <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="businessName"
          autoComplete="organization"
          value={values.businessName}
          onChange={(e) => set("businessName", e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
        {errors.email ? (
          <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => set("password", e.target.value)}
          aria-invalid={!!errors.password}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
        {errors.password ? (
          <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          aria-invalid={!!errors.confirmPassword}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
        {errors.confirmPassword ? (
          <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-grove-700 underline hover:text-grove-900">
          Log in
        </Link>
      </p>
    </form>
  );
}
