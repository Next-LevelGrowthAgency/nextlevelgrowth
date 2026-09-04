import { AdminNotConfigured, StatTile } from "@/components/admin/StatTile";
import { getSiteAnalyticsSnapshot, listRecentActivity } from "@/lib/site-analytics";
import type { AnalyticsWindowDays } from "@/lib/growth-coach/adapters/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Traffic — Admin", robots: { index: false, follow: false } };

const VERCEL_ANALYTICS_URL = "https://vercel.com/next-level-growth/nextlevelgrowth/analytics";
const WINDOWS: AnalyticsWindowDays[] = [7, 30, 90];

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/pricing": "Pricing",
  "/approach": "Our Approach",
  "/work": "Work",
  "/about": "About",
  "/contact": "Contact",
};

function TrendBars({ points }: { points: { date: string; count: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <div className="flex h-24 items-end gap-0.5">
      {points.map((point) => (
        <div key={point.date} className="group relative flex-1">
          <div
            className={cn("w-full rounded-t bg-gradient-to-t from-teal-500 to-blue-600", point.count === 0 && "bg-ink-100")}
            style={{ height: `${Math.max(4, (point.count / max) * 96)}px` }}
          />
          <div className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink-900 px-1.5 py-0.5 text-[10px] text-white group-hover:block">
            {point.date}: {point.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminTrafficPage({ searchParams }: { searchParams: Promise<{ window?: string }> }) {
  const { window: windowParam } = await searchParams;
  const windowDays = (WINDOWS.includes(Number(windowParam) as AnalyticsWindowDays) ? Number(windowParam) : 30) as AnalyticsWindowDays;

  const [site, recent] = await Promise.all([getSiteAnalyticsSnapshot(windowDays), listRecentActivity(20)]);
  const pageViewEntries = Object.entries(site.pageViewsByPath).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md text-ink-900">Traffic</h1>
        <div className="flex gap-1 rounded-full border border-ink-200 p-1 text-sm">
          {WINDOWS.map((w) => (
            <Link
              key={w}
              href={`/admin/traffic?window=${w}`}
              className={cn("rounded-full px-3 py-1", w === windowDays ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-paper-200")}
            >
              {w}d
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        First-party page views and conversion events this site tracks directly
        {site.durable ? "" : " (best-effort, in-memory — connect Supabase for a real date window and history)"}.
      </p>

      <AdminNotConfigured>
        <p className="font-medium text-ink-700">Unique visitors, referrers, and traffic sources live in Vercel, not here.</p>
        <p className="mt-1">
          Vercel Web Analytics is installed and collecting that data — it&rsquo;s just not available through this
          dashboard&rsquo;s API access on the current plan.
        </p>
        <a href={VERCEL_ANALYTICS_URL} target="_blank" rel="noreferrer noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
          Open Vercel Analytics <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </AdminNotConfigured>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Page Views — Daily Trend</p>
      <div className="mt-3 rounded-xl border border-ink-100 bg-white p-4">
        {site.durable && site.dailyPageViews.length > 0 ? (
          <TrendBars points={site.dailyPageViews} />
        ) : (
          <p className="text-sm text-ink-500">No daily trend available yet — connect Supabase (durable storage) to see this.</p>
        )}
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Views by Page</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {pageViewEntries.length === 0 ? (
          <p className="col-span-full text-sm text-ink-500">No page views recorded yet.</p>
        ) : (
          pageViewEntries.map(([path, count]) => <StatTile key={path} label={PAGE_LABELS[path] ?? path} value={count} />)
        )}
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Recent Activity</p>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        {recent.length === 0 ? (
          <p className="p-4 text-sm text-ink-500">No activity recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Page</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((event) => (
                <tr key={event.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">{event.eventName}</td>
                  <td className="px-5 py-3 text-ink-600">{event.pagePath ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-500">{new Date(event.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
