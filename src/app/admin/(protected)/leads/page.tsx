import { getLeadAdapter } from "@/lib/growth-coach/adapters";
import type { LeadProfile } from "@/types";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads — Admin", robots: { index: false, follow: false } };

const SOURCE_LABEL: Record<string, string> = { contact: "Contact form", "growth-audit": "Growth Audit", "growth-coach": "Growth Coach" };
const STATUS_OPTIONS: NonNullable<LeadProfile["followUpStatus"]>[] = ["new", "contacted", "qualified", "follow-up-needed", "won", "lost"];

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<{ source?: string; status?: string; q?: string }> }) {
  const { source, status, q } = await searchParams;
  const allLeads = await getLeadAdapter().listLeads();

  const filtered = allLeads.filter((lead) => {
    if (source && lead.source !== source) return false;
    if (status && (lead.followUpStatus ?? "new") !== status) return false;
    if (q) {
      const needle = q.toLowerCase();
      const haystack = [lead.firstName, lead.lastName, lead.email, lead.businessName, lead.industry, lead.city].filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sources = [...new Set(allLeads.map((l) => l.source))];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md text-ink-900">Leads</h1>
        <p className="text-sm text-ink-500">{filtered.length} of {allLeads.length}</p>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, business…"
          className="min-w-[220px] flex-1 rounded-lg border border-ink-200 px-4 py-2 text-sm"
        />
        <select name="source" defaultValue={source ?? ""} className="rounded-lg border border-ink-200 px-3 py-2 text-sm">
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s] ?? s}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-ink-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium hover:border-ink-900">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Qualification</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                  No leads match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-ink-50 last:border-0 hover:bg-paper-100">
                  <td className="px-5 py-3 text-ink-600">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium text-grove-700 hover:underline">
                      {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email || "(unnamed)"}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{lead.businessName ?? "—"}</td>
                  <td className="px-5 py-3">{SOURCE_LABEL[lead.source] ?? lead.source}</td>
                  <td className="px-5 py-3">{lead.followUpStatus ?? "new"}</td>
                  <td className="px-5 py-3">{lead.leadQualificationLevel ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
