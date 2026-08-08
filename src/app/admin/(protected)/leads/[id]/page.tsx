import { getLeadAdapter } from "@/lib/growth-coach/adapters";
import { buildOwnerSummary } from "@/lib/growth-coach/lead-profile";
import { cn } from "@/lib/utils";
import type { LeadProfile } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { addInternalNote, retryInternalNotification, updateLeadStatus } from "../actions";

export const metadata: Metadata = { title: "Lead Detail — Admin", robots: { index: false, follow: false } };

const STATUS_OPTIONS: NonNullable<LeadProfile["followUpStatus"]>[] = ["new", "contacted", "qualified", "follow-up-needed", "won", "lost"];

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adapter = getLeadAdapter();
  const lead = await adapter.getLead(id);
  if (!lead) notFound();

  const summary = buildOwnerSummary(lead);
  const transcript = await adapter.getConversationTranscript(id);
  const allEmailEvents = await adapter.listEmailEvents(200);
  const emailEvents = allEmailEvents.filter((e) => e.leadId === id);

  async function updateStatus(formData: FormData) {
    "use server";
    await updateLeadStatus(id, formData.get("status") as NonNullable<LeadProfile["followUpStatus"]>);
  }

  async function addNote(formData: FormData) {
    "use server";
    await addInternalNote(id, String(formData.get("note") ?? ""));
  }

  async function retry() {
    "use server";
    await retryInternalNotification(id);
  }

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-ink-500 hover:text-ink-800">
        ← Back to leads
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md text-ink-900">{summary.name}</h1>
        <form action={updateStatus} className="flex items-center gap-2">
          <select name="status" defaultValue={lead.followUpStatus ?? "new"} className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm font-medium hover:border-ink-900">
            Update status
          </button>
        </form>
      </div>

      {summary.growthScore != null ? (
        <div className="mt-4 rounded-xl bg-ink-900 p-4 text-paper-100">
          <p className="text-xs uppercase tracking-wide text-paper-400">Growth Score</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold">{summary.growthScore}</span>
            <span className="text-paper-400">/ 100</span>
            <span className="ml-2 text-sm">{summary.growthScoreBand}</span>
          </div>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">Contact &amp; Business</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Row label="Email" value={summary.email} />
            <Row label="Phone" value={summary.phone} />
            <Row label="Preferred contact" value={summary.preferredContactMethod} />
            <Row label="Business" value={summary.businessName} />
            <Row label="Location" value={summary.location} />
            <Row label="Website" value={summary.website} />
            <Row label="Source" value={lead.source} />
          </dl>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink-900">Assessment</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Row label="Primary goal" value={summary.primaryGoal} />
            <Row label="Primary challenge" value={summary.primaryChallenge} />
            <Row label="Biggest growth gap" value={summary.biggestGrowthGap} />
            <Row label="Recommended plan" value={summary.recommendedPlan} />
            <Row label="Qualification" value={summary.qualification} />
            <Row label="Consultation requested" value={summary.consultationRequested ? "Yes" : "No"} />
          </dl>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink-900">Consent Record</h2>
          <p className="mt-1 text-xs text-ink-500">
            The full record of what this visitor opted into, when, and against which disclosure/terms version — kept
            for dispute resolution, not just display.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="py-2 pr-4">Channel</th>
                  <th className="py-2 pr-4">Consented</th>
                  <th className="py-2 pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Report delivery (required at submission)", granted: lead.consentToSaveReport, when: lead.reportConsentTimestamp },
                  { label: "Email follow-up (beyond the report)", granted: lead.consentToEmailFollowUp ?? false, when: lead.contactConsentTimestamp },
                  { label: "Phone call", granted: lead.consentToPhoneCall ?? false, when: lead.contactConsentTimestamp },
                  { label: "Marketing emails", granted: lead.consentToMarketing, when: lead.marketingConsentTimestamp },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-ink-50 last:border-0">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className={cn("py-2 pr-4 font-medium", row.granted ? "text-grove-700" : "text-ink-400")}>{row.granted ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4 text-ink-500">{row.granted && row.when ? new Date(row.when).toISOString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Row label="Consent language version" value={lead.consentLanguageVersion} />
            <Row label="Terms of Service version accepted" value={lead.consentTermsVersion} />
            <Row label="Submission IP (hashed, not raw)" value={lead.consentIpHash} />
            <Row label="Submission user agent" value={lead.consentUserAgent} />
          </dl>
        </div>

        {transcript && transcript.messages.length > 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-ink-900">Growth Coach Transcript</h2>
            <p className="mt-1 text-xs text-ink-500">
              Path: {transcript.businessPath ?? "—"} · Depth: {transcript.responseDepth ?? "—"}
            </p>
            <div className="mt-3 max-h-96 space-y-2 overflow-y-auto rounded-xl bg-paper-100 p-4 text-sm">
              {transcript.messages.map((m, i) => (
                <p key={i} className={m.role === "assistant" ? "text-ink-800" : "font-medium text-ink-900"}>
                  <span className="text-xs uppercase text-ink-500">{m.role}: </span>
                  {m.content}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Email Delivery</h2>
            <form action={retry}>
              <button type="submit" className="rounded-lg border border-ink-300 px-3 py-1.5 text-xs font-medium hover:border-ink-900">
                Retry internal notification
              </button>
            </form>
          </div>
          {emailEvents.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No email events recorded for this lead yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {emailEvents.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
                  <span>
                    {e.emailType} → {e.recipient}
                  </span>
                  <span className={e.status === "sent" ? "font-medium text-grove-700" : "font-medium text-red-700"}>{e.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-ink-900">Internal Notes</h2>
          {lead.internalNotes ? <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-paper-100 p-3 text-sm text-ink-700">{lead.internalNotes}</pre> : null}
          <form action={addNote} className="mt-3 flex gap-2">
            <input name="note" placeholder="Add a note…" className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium hover:border-ink-900">
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
