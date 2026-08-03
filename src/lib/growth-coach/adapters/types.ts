import type { CoachTranscriptMessage, EmailEvent, EmailEventStatus, EmailEventType, LeadProfile, LeadQualification } from "@/types";

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
    consent: { saveReport?: boolean; emailFollowUp?: boolean; phoneCall?: boolean; textMessage?: boolean; marketing?: boolean },
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

  /** Append-only email delivery log — one row per send attempt, success or failure. Never throws; a logging failure must not break the request that triggered it. */
  recordEmailEvent(event: {
    leadId: string | null;
    emailType: EmailEventType;
    recipient: string;
    status: EmailEventStatus;
    providerMessageId?: string;
    errorMessage?: string;
  }): Promise<EmailEvent>;

  /** Stores/updates the Growth Coach transcript for a session — called once at lead-capture time in this phase (not after every message). */
  saveConversationTranscript(input: {
    leadId: string | null;
    userId?: string | null;
    businessPath: string | null;
    responseDepth: string | null;
    summary: string | null;
    messages: CoachTranscriptMessage[];
  }): Promise<void>;

  /** Most recent email events first, for the admin email-events view. */
  listEmailEvents(limit?: number): Promise<EmailEvent[]>;

  /** Reads back a stored transcript by lead id, for the admin lead-detail view. Null if none was ever saved (e.g. leads from before this feature, or non-Growth-Coach sources). */
  getConversationTranscript(leadId: string): Promise<{ messages: CoachTranscriptMessage[]; businessPath: string | null; responseDepth: string | null } | null>;
}

export type OutboundEmail = {
  to: string;
  subject: string;
  /** Plain-text body — always required, used as the text part and as the full content when no `html` is given (e.g. the console mock). */
  body: string;
  /** Rendered HTML body. When present (real provider sends), `body` is still sent as the plain-text alternative part. */
  html?: string;
  /**
   * A visitor's email address, when the send is a reply to something they
   * submitted — NEVER used as the sender/`from` address. The `from` address
   * is always a verified Next Level Growth domain address, set once via
   * EMAIL_FROM_ADDRESS in the adapter itself, not passed per-call.
   */
  replyTo?: string;
};

export interface EmailAdapter {
  /** Transactional send (report delivery, owner notification). `previewId` holds the provider's message ID (e.g. Resend's) when a real provider is active. */
  sendTransactional(email: OutboundEmail): Promise<{ ok: true; previewId: string }>;
  /** Enqueue a lead into a marketing sequence — only ever called after explicit marketing consent. */
  enqueueSequence(leadId: string, sequenceId: string): Promise<{ ok: true }>;
}
