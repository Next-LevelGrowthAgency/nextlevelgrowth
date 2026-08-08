"use server";

import { getEffectiveAdminSession, type EffectiveAdminSession } from "@/lib/auth/admin-session";
import { getServiceRoleClient, isSupabaseConfigured } from "@/lib/growth-coach/adapters/supabase-client";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { revalidatePath } from "next/cache";

/**
 * Every action here re-checks authorization independently, even though
 * the page that renders the triggering form already checked — same
 * pattern as admin/(protected)/leads/actions.ts's requireAuthorized().
 */
async function requireAuthorized(): Promise<Extract<EffectiveAdminSession, { authorized: true }>> {
  const session = await getEffectiveAdminSession();
  if (!session.authenticated || !session.authorized) {
    recordAuditEvent("role_changed", "unknown", { detail: "rejected: unauthorized client-access review attempt" });
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * The ONE narrow, safe role transition this app supports from the UI:
 * approving or denying a visitor's own request to become a 'client'.
 * This is deliberately NOT a general "edit any user's role to anything"
 * control — see users/page.tsx's copy and migration 0003's revoke on
 * `role` for why arbitrary role editing stays a manual SQL-editor step.
 * Uses the service-role client (bypasses RLS, same as every other
 * privileged write in this codebase) — authorization is enforced here,
 * server-side, before it's ever touched.
 */
export async function reviewClientAccessRequest(userId: string, approve: boolean): Promise<{ ok: boolean; message: string }> {
  const session = await requireAuthorized();
  if (!isSupabaseConfigured()) return { ok: false, message: "Not configured." };

  const supabase = getServiceRoleClient();
  const nowIso = new Date().toISOString();

  if (approve) {
    const { error, count } = await supabase
      .from("profiles")
      .update(
        { role: "client", role_request_status: "approved", role_reviewed_at: nowIso, role_reviewed_by: session.userId ?? null },
        { count: "exact" }
      )
      .eq("id", userId)
      .eq("role_request_status", "pending"); // only ever act on an actual pending request

    if (error) return { ok: false, message: "Something went wrong approving this request." };
    if (!count) return { ok: false, message: "That request is no longer pending (already reviewed, or none exists)." };

    recordAuditEvent("role_changed", session.role, { detail: `approved client access for user ${userId}` });
    revalidatePath("/admin/users");
    return { ok: true, message: "Approved — this user is now a client." };
  }

  const { error, count } = await supabase
    .from("profiles")
    .update({ role_request_status: "denied", role_reviewed_at: nowIso, role_reviewed_by: session.userId ?? null }, { count: "exact" })
    .eq("id", userId)
    .eq("role_request_status", "pending");

  if (error) return { ok: false, message: "Something went wrong denying this request." };
  if (!count) return { ok: false, message: "That request is no longer pending (already reviewed, or none exists)." };

  recordAuditEvent("client_access_denied", session.role, { detail: `denied client access for user ${userId}` });
  revalidatePath("/admin/users");
  return { ok: true, message: "Request denied." };
}
