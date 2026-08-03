import { getPortalSession } from "@/lib/auth/portal-session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Requests", robots: { index: false, follow: false } };

const STATUS_LABEL: Record<string, string> = {
  new: "Received",
  contacted: "We've reached out",
  qualified: "In review",
  "follow-up-needed": "Following up",
  won: "Complete",
  lost: "Closed",
};

export default async function PortalRequestsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal/requests");

  const supabase = await createSupabaseServerClient();
  // RLS ("users can read their own leads") already scopes this to the
  // signed-in user — the .eq() below is defense-in-depth, not the only
  // thing preventing a client from seeing someone else's requests.
  const { data: rows } = await supabase
    .from("growth_coach_leads")
    .select("id, source, business_name, primary_goal, follow_up_status, created_at")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  const SOURCE_LABEL: Record<string, string> = { contact: "Contact form", "growth-audit": "Growth Audit", "growth-coach": "Growth Coach" };

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">My Requests</h1>
      <p className="mt-1 text-ink-600">Everything you&rsquo;ve submitted to Next Level Growth while signed in.</p>

      {!rows || rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center text-ink-600">
          <p>No requests yet. Anything you submit through the Contact form, Growth Audit, or Growth Coach while signed in will show up here.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Business</th>
                <th className="px-5 py-3">Goal</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-5 py-3 text-ink-600">{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{SOURCE_LABEL[row.source] ?? row.source}</td>
                  <td className="px-5 py-3">{row.business_name ?? "—"}</td>
                  <td className="px-5 py-3">{row.primary_goal ?? "—"}</td>
                  <td className="px-5 py-3">{STATUS_LABEL[row.follow_up_status] ?? row.follow_up_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
