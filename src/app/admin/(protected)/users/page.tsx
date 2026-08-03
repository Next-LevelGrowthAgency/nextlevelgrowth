import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Metadata } from "next";

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

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Users</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">
        Role changes aren&rsquo;t editable from this screen yet — deliberately, since a role-escalation bug here would be a
        serious security issue. See the completion report&rsquo;s &ldquo;Changing a user&rsquo;s role&rdquo; instructions for the
        one-line SQL statement to run in the Supabase SQL Editor instead.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Business</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {!profiles || profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-500">
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
