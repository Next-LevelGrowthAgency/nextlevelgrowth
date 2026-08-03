"use server";

import { getEmailAdapter, getLeadAdapter, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { getEffectiveAdminSession, type EffectiveAdminSession } from "@/lib/auth/admin-session";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { buildInternalLeadEmail, buildInternalLeadEmailSubject } from "@/lib/growth-coach/email-templates";
import { buildOwnerSummary } from "@/lib/growth-coach/lead-profile";
import { siteConfig } from "@/lib/site-config";
import type { LeadProfile } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Every action here re-checks authorization independently, even though the
 * page that renders the triggering form already checked — a form that's
 * only reachable by an authorized user today must still refuse an
 * unauthorized session on its own if that ever changes.
 */
async function requireAuthorized(): Promise<Extract<EffectiveAdminSession, { authorized: true }>> {
  const session = await getEffectiveAdminSession();
  if (!session.authenticated || !session.authorized) {
    recordAuditEvent("lead_updated", "unknown", { detail: "rejected: unauthorized" });
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function updateLeadStatus(id: string, status: NonNullable<LeadProfile["followUpStatus"]>) {
  const session = await requireAuthorized();
  await getLeadAdapter().updateFollowUpStatus(id, status);
  recordAuditEvent("follow_up_status_changed", session.role, { leadId: id, detail: status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function addInternalNote(id: string, note: string) {
  const session = await requireAuthorized();
  const trimmed = note.trim().slice(0, 1000);
  if (!trimmed) return;
  const adapter = getLeadAdapter();
  const existing = await adapter.getLead(id);
  const combined = existing?.internalNotes
    ? `${existing.internalNotes}\n\n[${new Date().toLocaleString()}] ${trimmed}`
    : `[${new Date().toLocaleString()}] ${trimmed}`;
  await adapter.updateLead(id, { internalNotes: combined });
  recordAuditEvent("lead_updated", session.role, { leadId: id, detail: "note added" });
  revalidatePath(`/admin/leads/${id}`);
}

export async function retryInternalNotification(id: string): Promise<{ ok: boolean; message: string }> {
  const session = await requireAuthorized();
  const adapter = getLeadAdapter();
  const lead = await adapter.getLead(id);
  if (!lead) return { ok: false, message: "Lead not found." };
  if (!isEmailDeliveryActive()) return { ok: false, message: "Email delivery isn't configured yet." };

  recordAuditEvent("lead_updated", session.role, { leadId: id, detail: "internal notification retry requested" });
  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email;
  try {
    const summary = buildOwnerSummary(lead);
    const internal = buildInternalLeadEmail(lead, summary);
    const result = await getEmailAdapter().sendTransactional({
      to: notifyTo,
      replyTo: lead.email,
      subject: buildInternalLeadEmailSubject(lead),
      body: internal.text,
      html: internal.html,
    });
    await adapter.recordEmailEvent({ leadId: lead.id, emailType: "internal_notification", recipient: notifyTo, status: "sent", providerMessageId: result.previewId });
    revalidatePath(`/admin/leads/${id}`);
    revalidatePath("/admin/email-events");
    return { ok: true, message: "Notification re-sent." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await adapter.recordEmailEvent({ leadId: lead.id, emailType: "internal_notification", recipient: notifyTo, status: "failed", errorMessage: message });
    return { ok: false, message: "Retry failed. Check Resend configuration." };
  }
}
