import { AdminNotConfigured, StatTile } from "@/components/admin/StatTile";
import { getSiteAnalyticsSnapshot } from "@/lib/site-analytics";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Traffic — Admin", robots: { index: false, follow: false } };

const VERCEL_ANALYTICS_URL = "https://vercel.com/next-level-growth/nextlevelgrowth/analytics";

export default function AdminTrafficPage() {
  const site = getSiteAnalyticsSnapshot();
  const pageViewEntries = Object.entries(site.pageViews) as [string, number][];

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Traffic</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Two sources feed this page: real visitor traffic collected by Vercel Web Analytics (installed
        on this deploy), and a small set of first-party conversion counters this dashboard tracks
        directly.
      </p>

      <AdminNotConfigured>
        <p className="font-medium text-ink-700">Full visitor analytics (unique visitors, referrers, trends) live in Vercel, not here.</p>
        <p className="mt-1">
          This dashboard doesn&rsquo;t have API access to pull those numbers in — Vercel Web Analytics
          data is only available on their Pro plan API or through the dashboard below.
        </p>
        <a
          href={VERCEL_ANALYTICS_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Open Vercel Analytics <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </AdminNotConfigured>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">First-Party Conversion Events</p>
      <p className="mt-1 text-xs text-ink-400">
        Counted directly by this site — best-effort, in-memory, resets on redeploy. Not a substitute
        for the full visitor data above.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Growth Audit Clicks" value={site.growthAuditClicks} />
        <StatTile label="Package Clicks" value={site.packageClicks} />
        <StatTile label="Contact Started" value={site.contactStarts} />
        <StatTile label="Contact Submitted" value={site.contactSubmits} />
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Page Views</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {pageViewEntries.map(([page, count]) => (
          <StatTile key={page} label={page} value={count} />
        ))}
      </div>
    </div>
  );
}
