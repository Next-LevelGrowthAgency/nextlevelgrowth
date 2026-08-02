import type { LeadProfile, LeadQualification } from "@/types";

/**
 * PHASE 2 SEAM — swap `local-mock.ts`'s implementations for a real
 * provider (Supabase, HubSpot, GoHighLevel, a custom API, etc.) once one
 * is chosen and approved. Nothing outside this folder should know or care
 * which concrete adapter is in use — components and API routes depend
 * only on these interfaces.
 */

export type LeadInput = Omit<LeadProfile, "id" | "createdAt" | "updatedAt">;

export interface LeadAdapter {
  createLead(input: LeadInput): Promise<LeadProfile>;
  updateLead(id: string, patch: Partial<LeadProfile>): Promise<LeadProfile | null>;
  getLead(id: string): Promise<LeadProfile | null>;
  listLeads(): Promise<LeadProfile[]>;
  recordConsent(
    id: string,
    consent: { saveReport?: boolean; contact?: boolean; marketing?: boolean },
    timestamp: number
  ): Promise<LeadProfile | null>;
  saveReport(id: string, reportSummary: string): Promise<LeadProfile | null>;
  saveConversationSummary(id: string, summary: string): Promise<LeadProfile | null>;
  updateQualification(id: string, level: LeadQualification): Promise<LeadProfile | null>;
  updateFollowUpStatus(id: string, status: NonNullable<LeadProfile["followUpStatus"]>): Promise<LeadProfile | null>;
  recordEmailSubscription(id: string, subscribed: boolean, timestamp: number): Promise<LeadProfile | null>;
  recordSource(id: string, source: string, campaignSource?: string): Promise<LeadProfile | null>;
  requestDeletion(id: string): Promise<boolean>;
  exportLead(id: string): Promise<LeadProfile | null>;
}

export type OutboundEmail = {
  to: string;
  subject: string;
  body: string;
};

export interface EmailAdapter {
  /** Transactional send (report delivery, owner notification). */
  sendTransactional(email: OutboundEmail): Promise<{ ok: true; previewId: string }>;
  /** Enqueue a lead into a marketing sequence — only ever called after explicit marketing consent. */
  enqueueSequence(leadId: string, sequenceId: string): Promise<{ ok: true }>;
}
