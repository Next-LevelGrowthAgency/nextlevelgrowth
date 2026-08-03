import { getAnalyticsCounts } from "@/lib/growth-coach/analytics-store";
import { localLeadAdapter } from "@/lib/growth-coach/adapters/local-mock";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { getAdminSession, isAuthorizedForLeadData } from "@/lib/growth-coach/auth/guard";
import { buildDashboardOverview } from "@/lib/growth-coach/dashboard-overview";
import { buildOwnerSummary } from "@/lib/growth-coach/lead-profile";
import type { LeadProfile } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { addInternalNote, updateLeadStatus } from "./actions";

// DEVELOPMENT-ONLY PAGE — see the on-page banner below and actions.ts.
// Real gate is src/middleware.ts (server-enforced, runs before this page).
export const metadata: Metadata = {
  title: "Growth Coach Leads (Dev Preview)",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS: NonNullable<LeadProfile["followUpStatus"]>[] = ["new", "contacted", "qualified", "follow-up-needed", "won", "lost"];

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value ?? "–"}</dd>
    </div>
  );
}

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

export default async function GrowthCoachLeadsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await getAdminSession();

  // Middleware already blocks unauthenticated requests, but role
  // authorization is checked independently here — a valid session with
  // an insufficient role must never receive lead data from the server.
  if (!isAuthorizedForLeadData(session)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-lifted">
          <h1 className="font-display text-xl font-semibold text-ink-900">Not authorized</h1>
          <p className="mt-2 text-sm text-ink-600">
            {session ? `Your session role ("${session.role}") does not have access to lead data.` : "You need to log in to view this page."}
          </p>
          <form action="/api/admin/logout" method="POST" className="mt-4">
            <button type="submit" className="text-sm font-medium text-grove-700 hover:underline">
              Log out and try a different role
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { id } = await searchParams;
  const leads = await localLeadAdapter.listLeads();
  const selected = id ? await localLeadAdapter.getLead(id) : null;
  const summary = selected ? buildOwnerSummary(selected) : null;
  if (selected) recordAuditEvent("lead_viewed", session!.role, { leadId: selected.id });

  const overview = buildDashboardOverview(leads, getAnalyticsCounts());

  return (
    <div className="min-h-screen bg-paper-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-sm text-ink-800">
          <div>
            <p className="font-semibold">Development preview, dev-grade authentication only.</p>
            <p className="mt-1">
              Real server-side session gating is active (see src/middleware.ts), but this is still a single shared dev
              password with no user table or MFA. Do not deploy without real production authentication. See the
              completion report's recommendation.
            </p>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="shrink-0 rounded-full border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-900">
              Log out
            </button>
          </form>
        </div>

        <div className="mt-4 text-xs text-ink-500">
          Logged in as <span className="font-medium text-ink-800">{session!.role}</span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">Growth Coach Dashboard</h1>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total Leads" value={overview.totalLeads} />
          <StatTile label="Avg Growth Score" value={overview.averageGrowthScore ?? "–"} />
          <StatTile label="Avg Confidence" value={overview.averageConfidenceLabel ?? "–"} />
          <StatTile label="Conversion Rate" value={overview.conversionRate !== null ? `${overview.conversionRate}%` : "–"} />
          <StatTile label="New" value={overview.newLeads} />
          <StatTile label="Follow-Up Due" value={overview.followUpDue} />
          <StatTile label="High Priority" value={overview.highPriorityLeads} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Funnel</p>
            <div className="mt-2">
              <CountList items={overview.funnel} />
            </div>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Most Common Weaknesses</p>
            <div className="mt-2">
              <CountList items={overview.topWeaknessCategories} />
            </div>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Most Common Strengths</p>
            <div className="mt-2">
              <CountList items={overview.topStrengthCategories} />
            </div>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Most Recommended Services</p>
            <div className="mt-2">
              <CountList items={overview.topServices} />
            </div>
          </div>
          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Most Recommended Plans</p>
            <div className="mt-2">
              <CountList items={overview.topPlans} />
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

        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-paper-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Growth Score</th>
                <th className="px-4 py-3">Biggest Gap</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {leads.map((lead) => (
                <tr key={lead.id} className={lead.id === id ? "bg-grove-50" : undefined}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/growth-coach-leads?id=${lead.id}`} className="font-medium text-grove-700 hover:underline">
                      {lead.firstName ?? "–"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{lead.businessName ?? "–"}</td>
                  <td className="px-4 py-3">{lead.industry ?? "–"}</td>
                  <td className="px-4 py-3">{[lead.city, lead.state].filter(Boolean).join(", ") || "–"}</td>
                  <td className="px-4 py-3">{lead.growthScore !== undefined && lead.growthScore !== null ? `${lead.growthScore}/100` : "–"}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={lead.biggestGrowthGap}>
                    {lead.biggestGrowthGap ?? "–"}
                  </td>
                  <td className="px-4 py-3">{lead.leadQualificationLevel ?? "–"}</td>
                  <td className="px-4 py-3">{lead.recommendedPlan?.name ?? "–"}</td>
                  <td className="px-4 py-3">{lead.followUpStatus ?? "new"}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(lead.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-ink-500">
                    No leads captured yet in this server session.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {summary ? (
          <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">{summary.name}</h2>
              <Link href="/admin/growth-coach-leads" className="text-sm text-ink-500 hover:text-ink-800">
                Close
              </Link>
            </div>

            {summary.growthScore !== undefined && summary.growthScore !== null ? (
              <div className="mt-3 rounded-xl bg-ink-900 p-4 text-paper-100">
                <p className="text-xs uppercase tracking-wide text-paper-400">Growth Score</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold">{summary.growthScore}</span>
                  <span className="text-paper-400">/ 100</span>
                  <span className="ml-2 text-sm">{summary.growthScoreBand}</span>
                </div>
                <p className="mt-1 text-xs text-paper-300">Confidence: {summary.growthScoreConfidence}</p>
                {summary.growthCategorySnapshot && summary.growthCategorySnapshot.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {summary.growthCategorySnapshot.map((c) => (
                      <div key={c.categoryId} className="flex justify-between text-xs text-paper-300">
                        <span>{c.label}</span>
                        <span className="font-medium text-paper-100">{c.score}/100</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <SummaryRow label="Email" value={summary.email} />
              <SummaryRow label="Phone" value={summary.phone} />
              <SummaryRow label="Preferred contact" value={summary.preferredContactMethod} />
              <SummaryRow label="Business" value={summary.businessName} />
              <SummaryRow label="Location" value={summary.location} />
              <SummaryRow label="Website" value={summary.website} />
              <SummaryRow label="Primary challenge" value={summary.primaryChallenge} />
              <SummaryRow label="Primary goal" value={summary.primaryGoal} />
              <SummaryRow label="Timeline" value={summary.timeline} />
              <SummaryRow label="Biggest growth gap" value={summary.biggestGrowthGap} />
              <SummaryRow label="Recommended services" value={summary.recommendedServices.join(", ") || undefined} />
              <SummaryRow label="Recommended plan" value={summary.recommendedPlan} />
              <SummaryRow label="Qualification" value={summary.qualification} />
              <SummaryRow label="Consultation requested" value={summary.consultationRequested ? "Yes" : "No"} />
              <SummaryRow label="90-day plan requested" value={summary.ninetyDayPlanRequested ? "Yes" : "No"} />
              <SummaryRow label="Save-report consent" value={summary.consent.saveReport ? "Yes" : "No"} />
              <SummaryRow label="Email follow-up consent" value={summary.consent.emailFollowUp ? "Yes" : "No"} />
              <SummaryRow label="Phone call consent" value={summary.consent.phoneCall ? "Yes" : "No"} />
              <SummaryRow label="Text message consent" value={summary.consent.textMessage ? "Yes" : "No"} />
              <SummaryRow label="Marketing consent" value={summary.consent.marketing ? "Yes" : "No"} />
            </dl>

            <div className="mt-4 rounded-xl bg-paper-100 p-4 text-sm">
              <p className="font-medium text-ink-800">Report summary</p>
              <p className="mt-1 text-ink-600">{summary.reportSummary}</p>
            </div>
            <div className="mt-3 rounded-xl bg-paper-100 p-4 text-sm">
              <p className="font-medium text-ink-800">Suggested follow-up approach</p>
              <p className="mt-1 text-ink-600">{summary.suggestedFollowUpApproach}</p>
            </div>

            {selected?.internalNotes ? (
              <div className="mt-3 rounded-xl bg-paper-100 p-4 text-sm">
                <p className="font-medium text-ink-800">Internal notes</p>
                <p className="mt-1 whitespace-pre-line text-ink-600">{selected.internalNotes}</p>
              </div>
            ) : null}

            <form
              action={async (formData) => {
                "use server";
                const note = String(formData.get("note") ?? "");
                await addInternalNote(summary.leadId, note);
              }}
              className="mt-3 flex gap-2"
            >
              <label htmlFor="note" className="sr-only">
                Add an internal note
              </label>
              <input
                id="note"
                name="note"
                placeholder="Add an internal note…"
                className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2"
              />
              <button type="submit" className="rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:bg-ink-800">
                Add note
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-600">Mark as:</span>
              {STATUS_OPTIONS.map((status) => (
                <form
                  key={status}
                  action={async () => {
                    "use server";
                    await updateLeadStatus(summary.leadId, status);
                  }}
                >
                  <button
                    type="submit"
                    className={`rounded-full border px-3 py-1 text-xs hover:border-ink-900 ${
                      summary.followUpStatus === status ? "border-grove-600 bg-grove-50 text-grove-800" : "border-ink-200 text-ink-700"
                    }`}
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
