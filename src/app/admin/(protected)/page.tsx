import { getLeadAdapter, isDurableStorageActive, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { getAnalyticsCounts } from "@/lib/growth-coach/analytics-store";
import { buildDashboardOverview } from "@/lib/growth-coach/dashboard-overview";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Overview", robots: { index: false, follow: false } };

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}

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
  const leads = await getLeadAdapter().listLeads();
  const overview = buildDashboardOverview(leads, getAnalyticsCounts());
  const emailActive = isEmailDeliveryActive();
  const dbActive = isDurableStorageActive();

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Overview</h1>

      {!emailActive || !dbActive ? (
        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-sm text-ink-800">
          {!dbActive ? <p>Durable storage isn&rsquo;t configured — leads are held in server memory only and reset on redeploy.</p> : null}
          {!emailActive ? <p>Email delivery isn&rsquo;t configured — notifications are logged to the server console only.</p> : null}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Leads" value={overview.totalLeads} />
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
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Top Industries / Cities</p>
          <div className="mt-2 space-y-3">
            <CountList items={overview.topIndustries} />
            <CountList items={overview.topCities} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/admin/leads" className="text-sm font-medium text-grove-700 underline hover:text-grove-900">
          View all leads →
        </Link>
      </div>
    </div>
  );
}
