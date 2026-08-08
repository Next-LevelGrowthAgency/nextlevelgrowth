import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Metadata } from "next";
import { reviewClientAccessRequest } from "./actions";

export const metadata: Metadata = { title: "Users — Admin", robots: { index: false, follow: false } };

export default async function AdminUsersPage() {
  if (!isSupabaseAuthConfigured()) {
    return (
      <div>
        <h1 className="font-display text-display-md text-ink-900">Users</h1>
        <div className="mt-6 rounded-xl border border-dashed border-ink-300 bg-white p-8 text-center text-ink-600">
          User accounts require Supabase Auth to be configured. See the completion report&rsquo;s setup steps.
        </div>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  // RLS ("owner and admin can read all profiles") scopes this — a
  // non-owner/admin session would get an empty result here even though
  // this page is already gated by admin/(protected)/layout.tsx.
  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  const pendingRequests = (profiles ?? []).filter((p) => p.role_request_status === "pending");

  async function approve(userId: string) {
    "use server";
    await reviewClientAccessRequest(userId, true);
  }

  async function deny(userId: string) {
    "use server";
    await reviewClientAccessRequest(userId, false);
  }

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Users</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">
        Free-form role editing isn&rsquo;t available from this screen — deliberately, since a role-escalation bug here would
        be a serious security issue. The one exception is reviewing a client-access request below, which only ever moves a
        &lsquo;prospect&rsquo; to &lsquo;client&rsquo; and nothing else. Any other role change (owner, admin, team) still requires the
        one-line SQL statement in the Supabase SQL Editor — see the completion report.
      </p>

      {pendingRequests.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-signal-200 bg-signal-50 p-5">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Pending client-access requests ({pendingRequests.length})
          </h2>
          <ul className="mt-3 space-y-3">
            {pendingRequests.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white p-4">
                <div>
                  <p className="font-medium text-ink-900">{p.full_name || p.email}</p>
                  <p className="text-xs text-ink-500">
                    {p.email} · requested {p.role_requested_at ? new Date(p.role_requested_at).toLocaleString() : "—"}
                  </p>
                  {p.role_request_note ? <p className="mt-1 text-sm text-ink-700">&ldquo;{p.role_request_note}&rdquo;</p> : null}
                </div>
                <div className="flex gap-2">
                  <form action={approve.bind(null, p.id)}>
                    <button type="submit" className="rounded-lg bg-grove-700 px-4 py-2 text-sm font-medium text-white hover:bg-grove-800">
                      Approve
                    </button>
                  </form>
                  <form action={deny.bind(null, p.id)}>
                    <button type="submit" className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium hover:border-ink-900">
                      Deny
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Access request</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {!profiles || profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                  No accounts yet.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-5 py-3">{p.email}</td>
                  <td className="px-5 py-3">{p.full_name ?? "—"}</td>
                  <td className="px-5 py-3">{p.business_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={p.role === "owner" || p.role === "admin" ? "font-medium text-grove-700" : "text-ink-700"}>{p.role}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-600">{p.role_request_status && p.role_request_status !== "none" ? p.role_request_status : "—"}</td>
                  <td className="px-5 py-3 text-ink-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
