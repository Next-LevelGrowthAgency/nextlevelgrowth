import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Production-only landing for every /admin/* path (see src/middleware.ts,
 * which rewrites here whenever NODE_ENV === "production"). The dev-grade
 * shared-password login and lead dashboard never render in production,
 * regardless of whether GROWTH_COACH_ADMIN_DEV_PASSWORD_HASH /
 * GROWTH_COACH_SESSION_SECRET happen to be set.
 */
export default function AdminUnavailablePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-lifted">
        <div className="flex items-center justify-center gap-2 text-grove-700">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide">Next Level Growth</span>
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">Owner Dashboard</h1>
        <p className="mt-2 text-sm text-ink-600">This area isn&rsquo;t available yet. Please check back later.</p>
      </div>
    </div>
  );
}
