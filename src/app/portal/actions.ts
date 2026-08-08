"use server";

import { getPortalSession } from "@/lib/auth/portal-session";
import { getServiceRoleClient, isSupabaseConfigured } from "@/lib/growth-coach/adapters/supabase-client";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { revalidatePath } from "next/cache";

export type ClientAccessRequestResult = { ok: true } | { ok: false; message: string };

const MAX_NOTE_LENGTH = 500;

/**
 * Stage 5 "request client access" flow — a 'prospect' asks to become a
 * 'client'; an owner/admin approves or denies from /admin/users (see
 * ../admin/(protected)/users/actions.ts). No billing/payment involved.
 *
 * Uses the SERVICE ROLE client, not the visitor's own RLS-scoped one:
 * role_request_status is revoked from `authenticated` at the database
 * level (supabase/migrations/0007_client_access_requests.sql) specifically
 * so it can only ever be set to 'pending' through this server action —
 * the same reasoning as `role` itself being revoked in migration 0003.
 * This action decides the value written ('pending', server time); it
 * never trusts a status value from the client.
 */
export async function requestClientAccess(formData: FormData): Promise<ClientAccessRequestResult> {
  const session = await getPortalSession();
  if (!session) return { ok: false, message: "Your session has expired. Please log in again." };
  if (session.role !== "prospect") return { ok: false, message: "This isn't available for your account." };
  if (session.roleRequestStatus === "pending") return { ok: false, message: "You already have a request pending review." };
  if (!isSupabaseConfigured()) return { ok: false, message: "Not available right now." };

  const note = String(formData.get("note") ?? "").trim().slice(0, MAX_NOTE_LENGTH);

  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role_request_status: "pending",
      role_requested_at: new Date().toISOString(),
      role_request_note: note || null,
    })
    .eq("id", session.id)
    .eq("role", "prospect"); // re-check server-side at write time, not just the session read above

  if (error) return { ok: false, message: "Something went wrong submitting your request. Please try again." };

  recordAuditEvent("client_access_requested", "unknown", { detail: `user ${session.id} (${session.email}) requested client access` });
  revalidatePath("/portal");
  return { ok: true };
}
