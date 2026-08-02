import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Owner Login (Dev Preview)",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect password. Try again.",
  "rate-limited": "Too many attempts. Wait a moment and try again.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Try again.") : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 shadow-lifted">
        <div className="flex items-center gap-2 text-grove-700">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide">Next Level Growth</span>
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">Owner Dashboard</h1>

        <div className="mt-3 rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-xs text-ink-700">
          Development-only authentication: a single shared dev password, no real user accounts. Do not deploy without
          real authentication. See the production recommendation in the completion report.
        </div>

        {errorMessage ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form method="POST" action="/api/admin/login" className="mt-5 space-y-4">
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
              className="mt-1.5 w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
            />
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium text-ink-800">
              Role <span className="font-normal text-ink-500">(dev testing only, lets you exercise role-based authorization locally)</span>
            </label>
            <select
              id="role"
              name="role"
              defaultValue="owner"
              className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff (no lead-data access)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-grove-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-grove-700"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
