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

// -----------------------------------------------------------------------
// AI usage tracking — durable counters/log backing the Growth Coach's
// per-visitor daily tier limits and the split monthly cost circuit
// breaker (see src/lib/growth-coach/ai/circuit-breaker.ts, the only
// caller of this adapter). Same fail-safe factory pattern as
// Lead/EmailAdapter above: falls back to an in-memory mock when Supabase
// isn't configured, rather than crashing or silently skipping tracking.
// -----------------------------------------------------------------------

/** 'guest' = not signed in. 'free' = signed in, role !== 'client'. 'client' = signed in with the 'client' profile role. */
export type AiUsageTier = "guest" | "free" | "client";
/** Budget pool a tier's cost counts against — guest and free share the 'free' pool; client has its own. */
export type AiUsagePool = "free" | "client";

export type AiMonthlyBudgetState = {
  cumulativeCostUsd: number;
  alert80Sent: boolean;
  alert100Sent: boolean;
};

export interface AiUsageAdapter {
  /** Atomically increments today's message count for this (tier, identity) and returns the new count — used to enforce the daily per-tier cap. */
  incrementDailyTierUsage(tier: AiUsageTier, identityKey: string, dayKey: string): Promise<number>;

  /** Current cumulative estimated cost + alert-sent flags for a budget pool this month (zeroed/false if no row exists yet). */
  getMonthlyBudgetState(pool: AiUsagePool, monthKey: string): Promise<AiMonthlyBudgetState>;

  /** Atomically adds cost to the pool's monthly total and returns the new cumulative total. */
  incrementMonthlyBudgetUsage(pool: AiUsagePool, monthKey: string, costDeltaUsd: number): Promise<number>;

  /** Atomically claims the right to send a threshold alert — true only for the single caller that should actually send the email, false for every other concurrent caller. */
  claimBudgetAlert(pool: AiUsagePool, monthKey: string, threshold: "80" | "100"): Promise<boolean>;

  /** Appends one row to the usage audit log. Never throws — a logging failure must not break the AI response that triggered it. */
  recordUsageEvent(event: {
    tier: AiUsageTier;
    pool: AiUsagePool;
    userId: string | null;
    identityHash: string | null;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  }): Promise<void>;
}
