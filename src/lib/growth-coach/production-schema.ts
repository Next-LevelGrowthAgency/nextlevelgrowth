/**
 * PRODUCTION DATA MODEL — DOCUMENTATION ONLY, NOT CONNECTED
 * =======================================================================
 * Nothing in this file is imported by the running app. It's a normalized
 * schema sketch (as TypeScript interfaces, since no ORM/database has been
 * approved yet) for the eventual production store, plus the Row-Level
 * Security policy design for each table if Supabase/Postgres is chosen
 * (see the recommendation in the completion report). The current app
 * uses `adapters/local-mock.ts` (in-memory, dev-only) behind the
 * `LeadAdapter`/`EmailAdapter` interfaces in `adapters/types.ts` — a real
 * adapter implementing those same interfaces against tables shaped like
 * this is the intended migration path, so nothing above the adapter
 * boundary (engine, UI, API routes) should need to change.
 *
 * RLS DESIGN PRINCIPLE (applies to every table below unless noted):
 *   - Deny all public (anon) reads and updates by default.
 *   - Allow public INSERT only through the validated server route
 *     (/api/growth-coach/lead), using the anon key with a policy scoped
 *     to exactly the columns that route sets — never a blanket insert.
 *   - Allow SELECT/UPDATE only for authenticated rows where
 *     auth.jwt() ->> 'role' IN ('owner','admin') — 'staff' gets no lead
 *     row access, matching the app-layer authorization already enforced
 *     in auth/guard.ts.
 *   - All server-side reads/writes from Next.js route handlers use the
 *     Supabase *service role* key (bypasses RLS by design) — that key
 *     must only ever live in a server-only env var, never
 *     NEXT_PUBLIC_*, and is never sent to the client.
 *   - Consent columns are UPDATE-restricted to the owning server route
 *     only (visitors change consent only by resubmitting through the
 *     validated flow, never via a direct table update policy).
 */

export type ProdUUID = string;
export type ProdTimestamp = string; // ISO 8601, stored as `timestamptz`

/** auth.users equivalent if using Supabase Auth for the owner portal. RLS: no public access at all. */
export interface ProdUser {
  id: ProdUUID;
  email: string;
  displayName: string;
  createdAt: ProdTimestamp;
  lastLoginAt: ProdTimestamp | null;
  mfaEnabled: boolean;
}

/** Role assignment, kept separate from ProdUser so role changes are independently auditable. RLS: owner-only read/write. */
export interface ProdAdminRole {
  id: ProdUUID;
  userId: ProdUUID;
  role: "owner" | "admin" | "staff";
  grantedBy: ProdUUID;
  grantedAt: ProdTimestamp;
}

/** Real provider session record (if not using the provider's own session table). RLS: owner-only. */
export interface ProdSession {
  id: ProdUUID;
  userId: ProdUUID;
  createdAt: ProdTimestamp;
  expiresAt: ProdTimestamp;
  ipHash: string; // hashed, never raw IP at rest
  revokedAt: ProdTimestamp | null;
}

/** The core lead record. RLS: public INSERT (server route only) + owner/admin SELECT/UPDATE, deny DELETE (use requestDeletion workflow instead). */
export interface ProdLead {
  id: ProdUUID;
  sessionId: string;
  source: string;
  campaignSource: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  preferredContactMethod: "Email" | "Phone" | "Text" | null;
  leadQualificationLevel: string | null;
  followUpStatus: string;
  assignedOwner: ProdUUID | null;
  createdAt: ProdTimestamp;
  updatedAt: ProdTimestamp;
}

/** Split from ProdLead so business facts can be updated independently of contact/consent data. RLS: same as ProdLead. */
export interface ProdBusinessProfile {
  id: ProdUUID;
  leadId: ProdUUID;
  businessName: string | null;
  industry: string | null;
  city: string | null;
  state: string | null;
  serviceArea: string | null;
  websiteUrl: string | null;
  yearsInBusiness: string | null;
  businessStage: string | null;
  teamSize: string | null;
  revenueRange: string | null;
  marketingBudgetRange: string | null;
}

/** One row per consent TYPE per change — never overwritten, so history/withdrawal is always reconstructable. RLS: INSERT via server route only; SELECT owner/admin; no public UPDATE/DELETE ever. */
export interface ProdConsentRecord {
  id: ProdUUID;
  leadId: ProdUUID;
  consentType: "report_delivery" | "direct_contact" | "marketing_email";
  value: boolean;
  timestamp: ProdTimestamp;
  consentLanguageVersion: string; // e.g. "2026-08-01" — ties the record to the exact disclosure text shown
  source: string; // e.g. "growth-coach-lead-form"
  withdrawnAt: ProdTimestamp | null;
}

/** One row per Quick Check / Full Assessment run. RLS: same as ProdLead. */
export interface ProdGrowthAssessment {
  id: ProdUUID;
  leadId: ProdUUID | null; // nullable: an assessment can complete before a lead is ever captured
  sessionId: string;
  mode: "quick" | "full";
  startedAt: ProdTimestamp;
  completedAt: ProdTimestamp | null;
  answersJson: unknown; // structured JSON — the raw answer log, useful for re-scoring but not for querying, hence JSON not normalized rows
}

/** Normalized per-category result, one row per category per assessment — this IS worth normalizing (unlike raw answers) because "most common weaknesses across all leads" is a real query. RLS: same as ProdLead. */
export interface ProdGrowthCategoryScore {
  id: ProdUUID;
  assessmentId: ProdUUID;
  categoryId: string;
  normalizedScore: number;
  confidenceLabel: string;
  questionsAnswered: number;
  questionsSkipped: number;
  questionsUnknown: number;
}

/** The computed overall result snapshot — kept immutable per assessment (a re-run creates a new snapshot, never overwrites) so score-over-time trends are possible later. RLS: same as ProdLead. */
export interface ProdGrowthScoreSnapshot {
  id: ProdUUID;
  assessmentId: ProdUUID;
  overallScore: number | null;
  scoreBandLabel: string | null;
  overallConfidenceLabel: string;
  strongestCategoryId: string | null;
  weakestCategoryId: string | null;
  createdAt: ProdTimestamp;
}

/** RLS: same as ProdLead. */
export interface ProdStrength {
  id: ProdUUID;
  snapshotId: ProdUUID;
  categoryId: string;
  what: string;
  evidence: string;
  scalable: boolean;
  ownerDependent: boolean;
}

/** RLS: same as ProdLead. */
export interface ProdWeakness {
  id: ProdUUID;
  snapshotId: ProdUUID;
  categoryId: string;
  what: string;
  severity: "low" | "moderate" | "high";
  rootCause: string;
  countermeasure: string;
  priority: "do-now" | "do-next" | "do-later" | "not-yet";
}

/** Distinct from ProdWeakness — a gap is the higher-level narrative ("visibility gap"), a weakness is the specific finding driving it. RLS: same as ProdLead. */
export interface ProdGrowthGap {
  id: ProdUUID;
  snapshotId: ProdUUID;
  description: string;
  relatedWeaknessIds: ProdUUID[];
}

/** A recommended service or plan instance tied to a specific snapshot — kept as its own table (rather than only living in the JSON report) so "most recommended service this quarter" is a simple query. RLS: same as ProdLead. */
export interface ProdRecommendation {
  id: ProdUUID;
  snapshotId: ProdUUID;
  kind: "service" | "plan";
  refId: string; // ServiceId or PlanId from the app-level config
  priority: string | null;
}

/** RLS: same as ProdLead. */
export interface ProdActionPlan {
  id: ProdUUID;
  snapshotId: ProdUUID;
  horizon: "quick-win" | "30-day" | "90-day";
  description: string;
  completed: boolean;
}

/** The rendered report — stored as a JSON snapshot (it's a point-in-time document, not something queried field-by-field) plus a few indexed columns for lookup. RLS: same as ProdLead. */
export interface ProdGrowthReport {
  id: ProdUUID;
  leadId: ProdUUID;
  snapshotId: ProdUUID | null;
  reportJson: unknown;
  generatedAt: ProdTimestamp;
  deliveredAt: ProdTimestamp | null;
}

/** RLS: same as ProdLead. */
export interface ProdConversationSummary {
  id: ProdUUID;
  leadId: ProdUUID;
  summary: string;
  createdAt: ProdTimestamp;
}

/** Append-only follow-up history — never overwrite a past entry, matching "Owner requesting leads... follow-up history." RLS: same as ProdLead. */
export interface ProdFollowUp {
  id: ProdUUID;
  leadId: ProdUUID;
  status: string;
  note: string | null;
  changedBy: ProdUUID;
  changedAt: ProdTimestamp;
}

/** RLS: same as ProdLead — internal notes must never be readable by the visitor under any policy. */
export interface ProdInternalNote {
  id: ProdUUID;
  leadId: ProdUUID;
  authorId: ProdUUID;
  note: string;
  createdAt: ProdTimestamp;
}

/** Separate from ProdConsentRecord because a subscription has ongoing state (active sequence, unsubscribe) beyond a single yes/no. RLS: INSERT/UPDATE via server route only; SELECT owner/admin. */
export interface ProdEmailSubscription {
  id: ProdUUID;
  leadId: ProdUUID;
  sequenceId: string | null;
  subscribed: boolean;
  subscribedAt: ProdTimestamp;
  unsubscribedAt: ProdTimestamp | null;
}

/** RLS: INSERT via server route only (service role); no SELECT policy for anon; owner/admin can read for the dashboard overview. Never store PII here — see analytics-store.ts's existing rule. */
export interface ProdAnalyticsEvent {
  id: ProdUUID;
  event: string;
  sessionIdHash: string | null; // pseudonymous, never the raw session id
  createdAt: ProdTimestamp;
}

/** RLS: INSERT via server role only, no UPDATE/DELETE policy for anyone (audit logs are append-only by design), SELECT owner-only. */
export interface ProdAuditEvent {
  id: ProdUUID;
  action: string;
  actorUserId: ProdUUID | null;
  actorRole: string;
  leadId: ProdUUID | null;
  detail: string | null;
  createdAt: ProdTimestamp;
}
