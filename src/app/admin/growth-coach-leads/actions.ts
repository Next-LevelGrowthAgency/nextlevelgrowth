"use server";

import { localLeadAdapter } from "@/lib/growth-coach/adapters/local-mock";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { getAdminSession, isAuthorizedForLeadData } from "@/lib/growth-coach/auth/guard";
import type { LeadProfile } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * DEVELOPMENT-ONLY server actions mutating the in-memory mock lead store.
 * Each one re-checks authorization server-side even though the page that
 * renders the triggering form already checked — never trust that a form
 * only reachable by an authorized user stays that way; the action itself
 * must refuse an unauthorized session independently.
 */
async function requireAuthorizedSession() {
  const session = await getAdminSession();
  if (!isAuthorizedForLeadData(session)) {
    recordAuditEvent("lead_updated", session?.role ?? "unknown", { detail: "rejected: unauthorized" });
    throw new Error("UNAUTHORIZED");
  }
  return session!;
}

export async function updateLeadStatus(id: string, status: NonNullable<LeadProfile["followUpStatus"]>) {
  const session = await requireAuthorizedSession();
  await localLeadAdapter.updateFollowUpStatus(id, status);
  recordAuditEvent("follow_up_status_changed", session.role, { leadId: id, detail: status });
  revalidatePath("/admin/growth-coach-leads");
}

export async function addInternalNote(id: string, note: string) {
  const session = await requireAuthorizedSession();
  const trimmed = note.trim().slice(0, 1000);
  if (!trimmed) return;
  const existing = await localLeadAdapter.getLead(id);
  const combined = existing?.internalNotes ? `${existing.internalNotes}\n\n[${new Date().toLocaleString()}] ${trimmed}` : `[${new Date().toLocaleString()}] ${trimmed}`;
  await localLeadAdapter.updateLead(id, { internalNotes: combined });
  recordAuditEvent("lead_updated", session.role, { leadId: id, detail: "note added" });
  revalidatePath("/admin/growth-coach-leads");
}
