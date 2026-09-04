import { StatTile } from "@/components/admin/StatTile";
import { getLeadAdapter, isDurableStorageActive, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { getAnalyticsCounts } from "@/lib/growth-coach/analytics-store";
import { buildDashboardOverview } from "@/lib/growth-coach/dashboard-overview";
import { getSiteAnalyticsSnapshot, listRecentActivity } from "@/lib/site-analytics";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview", robots: { index: false, follow: false } };

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page view",
  pricing_view: "Pricing viewed",
  approach_view: "Approach viewed",
  growth_audit_click: "Growth Audit clicked",
  foundation_click: "Foundation clicked",
  launch_click: "Launch clicked",
  growth_click: "Growth clicked",
  next_level_click: "Next Level clicked",
  contact_start: "Contact form started",
  contact_submit: "Contact form submitted",
};

function CountList({ items }: { items: { label: string; count: number }[] }) {
  if (items.length === 0) return <p className="text-sm text-ink-500">Not enough data yet.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.label} className="flex justify-between">
          <span className="text-ink-700">{item.label}</span>
          <span className="font-medium text-ink-900">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminOverviewPage() {
  const [leads, site, recent] = await Promise.all([getLeadAdapter().listLeads(), getSiteAnalyticsSnapshot(30), listRecentActivity(10)]);
  const overview = buildDashboardOverview(leads, getAnalyticsCounts());
  const emailActive = isEmailDeliveryActive();
  const dbActive = isDurableStorageActive();

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Overview</h1>

      {!emailActive || !dbActive ? (
        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-sm text-ink-800">
          {!dbActive ? <p>Durable storage isn&rsquo;t configured — leads and events are held in server memory only and reset on redeploy.</p> : null}
          {!emailActive ? <p>Email delivery isn&rsquo;t configured — notifications are logged to the server console only.</p> : null}
        </div>
      ) : null}

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Website Activity (last 30 days)</p>
        <p className="text-xs text-ink-400">
          Unique visitors: Not tracked here — see{" "}
          <a href="https://vercel.com/next-level-growth/nextlevelgrowth/analytics" target="_blank" rel="noreferrer noopener" className="underline hover:text-ink-600">
            Vercel Analytics
          </a>
          .
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Page Views" value={site.totalPageViews} />
        <StatTile label="Pricing Views" value={site.pricingViews} />
        <StatTile label="Approach Views" value={site.approachViews} />
        <StatTile label="Growth Audit Clicks" value={site.growthAuditClicks} />
        <StatTile label="Contact Submitted" value={site.contactSubmits} />
        <StatTile label="Top Page" value={site.topPage ?? "No Data Yet"} />
      </div>
      {!site.durable ? (
        <p className="mt-2 text-xs text-ink-400">
          Best-effort counts since the last redeploy (no date window yet) — connect Supabase for a real 30-day history. See{" "}
          <Link href="/admin/traffic" className="underline hover:text-ink-600">
            Traffic
          </Link>
          .
        </p>
      ) : null}

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Growth Coach &amp; Inquiries</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Inquiries" value={overview.totalLeads} />
        <StatTile label="Avg Growth Score" value={overview.averageGrowthScore ?? "–"} />
        <StatTile label="New" value={overview.newLeads} />
        <StatTile label="Follow-Up Due" value={overview.followUpDue} />
        <StatTile label="High Priority" value={overview.highPriorityLeads} />
        <StatTile label="Conversion Rate" value={overview.conversionRate !== null ? `${overview.conversionRate}%` : "–"} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Funnel</p>
          <div className="mt-2">
            <CountList items={overview.funnel} />
          </div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Most Recommended Services</p>
          <div className="mt-2">
            <CountList items={overview.topServices} />
          </div>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Recent Activity</p>
          <div className="mt-2">
            {recent.length === 0 ? (
              <p className="text-sm text-ink-500">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recent.map((event) => (
                  <li key={event.id} className="flex items-center justify-between gap-3">
                    <span className="text-ink-700">
                      {EVENT_LABELS[event.eventName] ?? event.eventName}
                      {event.pagePath ? <span className="text-ink-400"> · {event.pagePath}</span> : null}
                    </span>
                    <span className="shrink-0 text-xs text-ink-400">{new Date(event.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/leads" className="text-sm font-medium text-blue-600 underline hover:text-blue-800">
          View all inquiries →
        </Link>
      </div>
    </div>
  );
}
