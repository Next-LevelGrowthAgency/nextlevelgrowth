import { LoginForm } from "@/components/auth/LoginForm";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Dashboard — Log In",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect password. Try again.",
  "rate-limited": "Too many attempts. Wait a moment and try again.",
};

/**
 * The one canonical admin entry point (not the shared /login used by the
 * client portal) — a visitor unauthenticated for /admin/* lands here
 * (src/middleware.ts). Branches on whether real Supabase Auth is
 * configured:
 *   - Configured: the real, server-verified sign-in (LoginForm already
 *     calls supabase.auth.signInWithPassword and redirects to /admin on
 *     success — role authorization then happens server-side in
 *     admin/(protected)/layout.tsx).
 *   - Not configured: the pre-existing dev-only shared-password form,
 *     which src/api/admin/login/route.ts independently refuses to accept
 *     in production regardless of this page ever rendering — and
 *     middleware itself already rewrites this whole route to
 *     /admin/unavailable in production when Supabase isn't configured,
 *     so this branch is reachable in local/preview dev only. The final
 *     branch below is pure defense-in-depth for that unreachable case.
 */
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Try again.") : null;
  const supabaseReady = isSupabaseAuthConfigured();
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-lifted">
          <p className="text-eyebrow text-blue-600">Next Level Growth</p>
          <h1 className="mt-2 font-display text-xl font-semibold text-ink-900">Owner Dashboard</h1>
          <p className="mt-1.5 text-sm text-ink-600">Sign in to view website activity, inquiries, and performance.</p>

          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-5">
            {supabaseReady ? (
              <Suspense fallback={null}>
                <LoginForm hideSignupLink hideForgotPassword defaultRedirect="/admin" />
              </Suspense>
            ) : !isProduction ? (
              <>
                <div className="mb-4 rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-xs text-ink-700">
                  Development-only authentication: a single shared dev password, no real user accounts. Never active
                  in production — see the completion report for the real-auth setup steps.
                </div>
                <form method="POST" action="/api/admin/login" className="space-y-4">
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-ink-800">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      className="mt-1.5 w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="text-sm font-medium text-ink-800">
                      Role <span className="font-normal text-ink-500">(dev testing only)</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      defaultValue="owner"
                      className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff (no lead-data access)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Log in
                  </button>
                </form>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-ink-300 bg-paper-100 p-4 text-sm text-ink-600">
                Sign-in isn&rsquo;t configured yet. Please check back shortly.
              </div>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-paper-400">
          <Link href="/" className="underline hover:text-paper-100">
            Back to Website
          </Link>
        </p>
      </div>
    </div>
  );
}
