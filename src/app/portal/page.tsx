import { ClientAccessRequestForm } from "@/components/portal/ClientAccessRequestForm";
import { getPortalSession } from "@/lib/auth/portal-session";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  team: "Team",
  client: "Client",
  prospect: "Prospect",
};

export const metadata: Metadata = { title: "Portal Overview", robots: { index: false, follow: false } };

export default async function PortalOverviewPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal");

  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("growth_coach_leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-display-md text-ink-900">Welcome back{session.fullName ? `, ${session.fullName.split(" ")[0]}` : ""}.</h1>
        <p className="mt-1 text-ink-600">Here&rsquo;s a quick look at your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Requests submitted</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink-900">{count ?? 0}</p>
          <Link href="/portal/requests" className="mt-3 inline-block text-sm font-medium text-grove-700 underline hover:text-grove-900">
            View all requests
          </Link>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Account</p>
          <p className="mt-1 text-sm text-ink-700">{session.email}</p>
          {session.businessName ? <p className="text-sm text-ink-500">{session.businessName}</p> : null}
          <Link href="/portal/profile" className="mt-3 inline-block text-sm font-medium text-grove-700 underline hover:text-grove-900">
            Edit profile
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Account tier</p>
        <p className="mt-1 font-display text-xl font-semibold text-ink-900">{ROLE_LABEL[session.role] ?? session.role}</p>

        {session.role === "prospect" && session.roleRequestStatus === "pending" ? (
          <p className="mt-3 text-sm text-ink-600">
            Your request to become a client is pending review
            {session.roleRequestedAt ? ` (submitted ${new Date(session.roleRequestedAt).toLocaleDateString()})` : ""}.
          </p>
        ) : null}

        {session.role === "prospect" && (session.roleRequestStatus === "none" || session.roleRequestStatus === "denied") ? (
          <div className="mt-3">
            {session.roleRequestStatus === "denied" ? (
              <p className="mb-3 text-sm text-ink-600">Your previous request wasn&rsquo;t approved. You can submit a new one below.</p>
            ) : (
              <p className="mb-3 text-sm text-ink-600">
                Working with us already, or ready to become a client? Request client access below — no payment required, an
                owner or admin will review it.
              </p>
            )}
            <ClientAccessRequestForm />
          </div>
        ) : null}

        {session.role === "client" ? <p className="mt-3 text-sm text-ink-600">You&rsquo;re a client — thanks for working with us.</p> : null}
      </div>
    </div>
  );
}
