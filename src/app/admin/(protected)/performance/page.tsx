import { AdminNotConfigured } from "@/components/admin/StatTile";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Performance — Admin", robots: { index: false, follow: false } };

const VERCEL_SPEED_INSIGHTS_URL = "https://vercel.com/next-level-growth/nextlevelgrowth/speed-insights";

export default function AdminPerformancePage() {
  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Performance</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Real Core Web Vitals from actual visitor page loads, collected by Vercel Speed Insights
        (installed on this deploy).
      </p>

      <AdminNotConfigured>
        <p className="font-medium text-ink-700">Performance scores aren&rsquo;t embedded in this dashboard.</p>
        <p className="mt-1">
          Speed Insights data is only available through Vercel&rsquo;s dashboard or a paid API tier —
          this page links out rather than showing invented Lighthouse scores.
        </p>
        <a
          href={VERCEL_SPEED_INSIGHTS_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Open Vercel Speed Insights <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </AdminNotConfigured>

      <p className="mt-6 text-xs text-ink-400">
        Speed Insights was just added, so data will start appearing after the first real visitor page
        loads following this deploy — there&rsquo;s no history to show yet.
      </p>
    </div>
  );
}
