"use client";

import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { resetPasswordSchema } from "@/lib/auth-schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as "password" | "confirmPassword"] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      // Requires an active recovery session, established by the
      // /auth/callback route after the visitor clicks the emailed link —
      // if that step didn't happen, this call fails with a clear error
      // rather than silently changing the wrong account's password.
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setFormError("This reset link may have expired. Please request a new one.");
        setSubmitting(false);
        return;
      }
      router.push("/portal");
      router.refresh();
    } catch {
      setFormError("Couldn't reach the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
          New password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {submitting ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
