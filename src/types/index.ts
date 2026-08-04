export type NavLink = {
  label: string;
  href: string;
};

export type ServiceOutcome = {
  slug: string;
  headline: string;
  description: string;
  icon: string; // lucide-react icon name
  href: string;
};

export type FrameworkStage = {
  number: string;
  title: string;
  description: string;
};

export type Differentiator = {
  title: string;
  description: string;
  icon: string;
};

export type ConceptProject = {
  slug: string;
  industry: string;
  label: "Concept Project" | "Demonstration Build" | "Sample Transformation";
  challenge: string;
  strategy: string;
  services: string[];
  objective: string;
  accentColor: "signal" | "grove" | "ember" | "ink";
};

export type CapabilityProof = {
  title: string;
  description: string;
  icon: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type IndustryTag = {
  label: string;
};

export type GrowthAuditFormData = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  websiteUrl?: string;
  industry: string;
  location: string;
  primaryGoal: string;
  biggestChallenge: string;
  servicesOfInterest: string[];
  preferredContact: "Email" | "Phone" | "Text";
  additionalDetails?: string;
};

/**
 * Next Level Growth Coach — types shared between the mock coaching engine
 * (src/lib/growth-coach/engine.ts) and the UI (src/components/growth-coach/).
 */

export type CoachingMode =
  | "clarity"
  | "strategy"
  | "execution"
  | "performance"
  | "encouragement"
  | "challenge"
  | "life-design"
  | "financial-discipline"
  | "founder";

export type SuggestedPrompt = {
  id: string;
  label: string;
  icon: string; // lucide-react icon name, resolved via <Icon />
  tier: "primary" | "more";
};

export type ReportSection = {
  heading: string;
  body: string | string[];
};

export type StructuredReport = {
  title: string;
  demo?: boolean; // true = visually flagged as a demonstration/mock analysis
  scoreLabel?: string; // e.g. "6.5 / 10 (demo score)"
  sections: ReportSection[];
};

export type QuickReplyAction =
  | "consult-yes"
  | "consult-no"
  | "report-yes"
  | "report-not-now"
  | "start-full-assessment"
  | "ninety-day-yes"
  | "ninety-day-no";

/** How much depth the visitor wants in coach responses — see engine.ts's routing at the top of `respond()`. */
export type ResponseDepth = "quick" | "deep" | "guide-me";

/** Which of the two primary conversation paths the visitor selected — adapts question wording in engine.ts. */
export type BusinessPath = "start" | "grow";

export type QuickReply = {
  label: string;
  action: QuickReplyAction;
};

/** Structured answer choices for a Growth Score question — rendered as buttons, not free text. */
export type GrowthScoreQuestionPrompt = {
  questionId: string;
  options: { value: string; label: string }[];
  progress: { answered: number; total: number };
};

export type CoachMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: CoachingMode;
  report?: StructuredReport;
  businessReport?: BusinessGrowthReport;
  scoreQuestion?: GrowthScoreQuestionPrompt;
  growthScoreResult?: GrowthScoreResult;
  quickReplies?: QuickReply[];
  cta?: { label: string; href: string };
};

export type FlowId = "assessment" | "growth-plan" | "website-review" | null;

/** Single-follow-up topics for the seven prompts that aren't full scripted flows. */
export type CoachTopic =
  | "leads"
  | "google-visibility"
  | "marketing"
  | "systems"
  | "automation"
  | "prioritize"
  | "challenge"
  | null;

/**
 * Lightweight memory of what the coach has learned about this visitor so
 * far this session — used to personalize later mock replies (e.g. the
 * low-confidence fallback) instead of repeating the same generic line.
 */
export type CoachContext = {
  business: string | null;
  primaryGoal: string | null;
  mainFear: string | null;
  weeklyHours: number | null;
  currentPriority: string | null;
  /** Set when the visitor explicitly asks for the detailed 90-day plan to be included in their emailed report. */
  ninetyDayPlanRequested: boolean;
};

export type CoachState = {
  flow: FlowId;
  topic: CoachTopic;
  step: number;
  answers: string[];
  offeredConsult: boolean;
  context: CoachContext;
  /** Per-intent reply counter, used to cycle through response variants instead of repeating one. */
  categoryUseCount: Record<string, number>;
  /** Whether the "want a full Business Growth Report?" offer has already been made this session — asked at most once. */
  reportOffered: boolean;
  /** The most recently generated report, kept so "save & send" can reuse it without recomputing. */
  businessReport: BusinessGrowthReport | null;
  /** Non-null while a Quick Growth Check or Full Growth Assessment is in progress. */
  growthAssessment: GrowthAssessmentState | null;
  /** The most recently generated Growth Score, kept so it can be attached to a later report/lead without recomputing. */
  lastGrowthScore: GrowthScoreResult | null;
  /** Null until the visitor picks a depth (or the coach defaults to "guide-me" on first structured question) — see engine.ts. */
  responseDepth: ResponseDepth | null;
  /** Null until the visitor picks "Start My Business" or "Grow My Business" — adapts question wording, never blocks free-text coaching. */
  businessPath: BusinessPath | null;
};

// -----------------------------------------------------------------------
// Business Growth Report, service/plan recommendations, and lead capture
// -----------------------------------------------------------------------

export type ServiceId =
  | "website-design"
  | "website-redesign"
  | "website-maintenance"
  | "local-seo"
  | "gbp-optimization"
  | "reputation-reviews"
  | "ai-chatbot"
  | "ai-workflow-automation"
  | "lead-capture-systems"
  | "crm-setup"
  | "follow-up-automation"
  | "marketing-strategy"
  | "branding-positioning"
  | "conversion-optimization"
  | "lead-generation"
  | "monthly-growth-partnership";

export type ServiceRecommendation = {
  serviceId: ServiceId;
  name: string;
  problem: string;
  relevance: string;
  benefitType: string;
  priority: "do-now" | "do-next" | "do-later";
  dependencies?: string;
  whatToMeasure: string;
};

export type PlanId = "foundation" | "growth" | "scale" | "custom-partnership";

export type PlanRecommendation = {
  planId: PlanId;
  name: string;
  reason: string;
  included: string[];
  notIncluded: string[];
  nextStep: string;
};

export type BusinessGrowthReport = {
  generatedAt: number;
  businessName: string | null;
  visitorName: string | null;
  executiveSummary: string;
  currentState: string;
  idealState: string;
  growthGap: string;
  rootCauses: string[];
  strengths: string[];
  topOpportunities: string[];
  quickWins: string[];
  thirtyDayPlan: string[];
  ninetyDayRoadmap: { days1to30: string[]; days31to60: string[]; days61to90: string[] };
  keyMetrics: string[];
  risksAndConstraints: string[];
  recommendedServices: ServiceRecommendation[];
  recommendedPlan: PlanRecommendation;
  nextAction: string;
  /** Present when a Growth Score was generated earlier in the session. */
  growthScore?: GrowthScoreResult;
};

export type LeadQualification =
  | "exploring"
  | "developing-need"
  | "qualified-opportunity"
  | "high-priority-follow-up"
  | "not-ready-yet";

/**
 * Full lead-capture data model. Only firstName/email are required to
 * request the report; everything else is optional and filled in only
 * where the visitor volunteered it or the conversation surfaced it.
 */
export type LeadProfile = {
  id: string;
  sessionId: string;
  source: string;
  campaignSource?: string;

  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "Email" | "Phone" | "Text";

  businessName?: string;
  industry?: string;
  city?: string;
  state?: string;
  serviceArea?: string;
  websiteUrl?: string;
  primaryServices?: string;
  yearsInBusiness?: string;
  businessStage?: string;
  teamSize?: string;
  idealCustomer?: string;
  primaryGoal?: string;
  primaryChallenge?: string;
  marketingChannels?: string;
  monthlyLeadVolume?: string;
  leadResponseProcess?: string;
  websiteStatus?: string;
  googleBusinessProfileStatus?: string;
  reviewProcess?: string;
  revenueRange?: string;
  marketingBudgetRange?: string;
  weeklyTimeAvailable?: number;
  desiredTimeline?: string;
  personalConstraints?: string;

  serviceInterests?: string[];
  recommendedServices?: ServiceRecommendation[];
  recommendedPlan?: PlanRecommendation;

  conversationSummary?: string;
  /** Free-text message — the generic "how can we help" field from the Contact form (Growth Coach/Growth Audit leads use the more structured fields above/below instead). */
  message?: string;
  currentState?: string;
  idealState?: string;
  growthGap?: string;
  rootCause?: string;
  quickWins?: string[];
  thirtyDayPlan?: string[];
  ninetyDayRoadmap?: BusinessGrowthReport["ninetyDayRoadmap"];
  nextAction?: string;

  /** Signed-in visitor this lead belongs to, once portal accounts exist — null for anonymous submissions. */
  userId?: string | null;
  /** Exact validated payload as submitted, for audit/debugging — never displayed to the visitor, admin-only. */
  submissionPayload?: Record<string, unknown>;
  sourcePage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  leadQualificationLevel?: LeadQualification;
  consultationRequested?: boolean;
  ninetyDayPlanRequested?: boolean;

  growthScore?: number | null;
  growthScoreConfidence?: ConfidenceLabel;
  growthScoreBand?: string;
  biggestGrowthGap?: string;
  growthCategorySnapshot?: { categoryId: GrowthScoreCategoryId; label: string; score: number }[];

  consentToSaveReport: boolean;
  /** Derived: true if any of the three granular contact permissions below is true. Never collected directly from the visitor. */
  consentToContact: boolean;
  /** Separate, individually optional permissions — never combined into one checkbox. See GrowthCoachLeadForm.tsx. */
  consentToEmailFollowUp?: boolean;
  consentToPhoneCall?: boolean;
  consentToTextMessage?: boolean;
  consentToMarketing: boolean;
  reportConsentTimestamp?: number;
  /** Shared timestamp for whichever of the three granular contact permissions were set — they're always submitted together in one request. */
  contactConsentTimestamp?: number;
  marketingConsentTimestamp?: number;

  /** Ties this consent capture to the exact disclosure text version shown at submission time — see CONSENT_LANGUAGE_VERSION in lead-profile.ts. */
  consentLanguageVersion?: string;

  createdAt: number;
  updatedAt: number;
  followUpStatus?: "new" | "contacted" | "qualified" | "won" | "lost" | "follow-up-needed";
  assignedOwner?: string;
  internalNotes?: string;
};

// -----------------------------------------------------------------------
// Email delivery tracking, and Growth Coach conversation transcripts
// -----------------------------------------------------------------------

export type EmailEventType = "internal_notification" | "visitor_confirmation" | "account_welcome" | "password_reset" | "ai_budget_alert" | "other";
export type EmailEventStatus = "sent" | "failed";

export type EmailEvent = {
  id: string;
  leadId: string | null;
  emailType: EmailEventType;
  recipient: string;
  status: EmailEventStatus;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: number;
};

export type CoachTranscriptMessage = {
  role: "user" | "assistant";
  content: string;
};

export type GrowthCoachConversation = {
  id: string;
  leadId: string | null;
  userId: string | null;
  businessPath: string | null;
  responseDepth: string | null;
  summary: string | null;
  messages: CoachTranscriptMessage[];
  createdAt: number;
  updatedAt: number;
};

export type OwnerLeadSummary = {
  leadId: string;
  name: string;
  followUpStatus: NonNullable<LeadProfile["followUpStatus"]>;
  email: string;
  phone?: string;
  preferredContactMethod?: string;
  businessName?: string;
  industry?: string;
  location?: string;
  website?: string;
  businessStage?: string;
  teamSize?: string;
  primaryChallenge?: string;
  primaryGoal?: string;
  constraints?: string;
  timeline?: string;
  marketingChannels?: string;
  leadVolume?: string;
  revenueOrBudget?: string;
  servicesOfInterest?: string[];
  recommendedServices: string[];
  recommendedPlan: string;
  qualification: LeadQualification;
  growthScore?: number | null;
  growthScoreConfidence?: ConfidenceLabel;
  growthScoreBand?: string;
  biggestGrowthGap?: string;
  growthCategorySnapshot?: LeadProfile["growthCategorySnapshot"];
  respectfulFollowUpNote: string;
  reportSummary: string;
  nextAction: string;
  consultationRequested: boolean;
  ninetyDayPlanRequested: boolean;
  consent: {
    saveReport: boolean;
    /** Derived: true if any of the three below is true. */
    contact: boolean;
    emailFollowUp: boolean;
    phoneCall: boolean;
    textMessage: boolean;
    marketing: boolean;
  };
  consentTimestamps: { report?: number; contact?: number; marketing?: number };
  suggestedFollowUpApproach: string;
};

export type AnalyticsEvent =
  | "coach_opened"
  | "prompt_selected"
  | "assessment_started"
  | "assessment_completed"
  | "report_offered"
  | "report_accepted"
  | "report_declined"
  | "report_generated"
  | "lead_form_opened"
  | "lead_form_completed"
  | "contact_consent_accepted"
  | "contact_consent_declined"
  | "marketing_consent_accepted"
  | "marketing_consent_declined"
  | "consultation_offered"
  | "consultation_accepted"
  | "consultation_declined"
  | "service_recommendation_shown"
  | "plan_recommendation_shown"
  | "conversation_reset"
  | "api_error"
  | "report_generation_error"
  | "quick_check_started"
  | "full_assessment_started"
  | "assessment_question_answered"
  | "growth_score_generated"
  | "growth_score_low_confidence"
  | "response_depth_selected"
  | "business_path_selected"
  | "ninety_day_plan_requested"
  | "ninety_day_plan_declined"
  | "growth_coach_expanded"
  | "growth_coach_restored"
  | "growth_coach_ai_fallback"
  | "admin_login_success"
  | "admin_login_failed"
  | "admin_logout";

// -----------------------------------------------------------------------
// Next Level Growth Score
// -----------------------------------------------------------------------

export type GrowthScoreCategoryId =
  | "business-foundation"
  | "website-digital-presence"
  | "local-visibility-seo"
  | "lead-generation"
  | "sales-follow-up"
  | "customer-experience-retention"
  | "brand-trust"
  | "systems-operations"
  | "ai-automation-readiness"
  | "financial-discipline"
  | "leadership-team"
  | "founder-sustainability";

/** An option's value id, or one of the two universal non-scoring answers every question supports. */
export type ScoreAnswerValue = "unknown" | "not-applicable" | string;

export type GrowthScoreQuestionOption = {
  value: string;
  label: string;
  points: number;
};

export type GrowthScoreQuestion = {
  id: string;
  categoryId: GrowthScoreCategoryId;
  prompt: string;
  signal: "positive" | "risk";
  options: GrowthScoreQuestionOption[];
  maxPoints: number;
  weight: number;
  quickCheck: boolean;
};

export type GrowthScoreCategoryConfig = {
  id: GrowthScoreCategoryId;
  label: string;
  description: string;
  weight: number;
  enabled: boolean;
  relevantIndustries: string[] | "all";
  questions: GrowthScoreQuestion[];
  positiveIndicatorHints: string[];
  riskIndicatorHints: string[];
  thresholds: { strong: number; weak: number };
  recommendedActionsByWeakness: string[];
  relatedServiceIds: ServiceId[];
  relatedPlanHint?: PlanId;
  /** 1 (fast/cheap fix) – 5 (slow/expensive fix); used only in the prioritization formula, never shown as fake precision to the visitor. */
  effortProxy: number;
  displayOrder: number;
};

export type GrowthScoreAnswer = {
  questionId: string;
  categoryId: GrowthScoreCategoryId;
  value: ScoreAnswerValue;
  points: number | null;
  answeredAt: number;
};

export type GrowthAssessmentState = {
  mode: "quick" | "full";
  questionQueue: string[];
  currentQuestionId: string | null;
  answers: GrowthScoreAnswer[];
  completed: boolean;
};

export type ConfidenceLabel = "insufficient" | "low" | "moderate" | "high";

export type GrowthWeakness = {
  categoryId: GrowthScoreCategoryId;
  what: string;
  evidence: string;
  severity: "low" | "moderate" | "high";
  businessImpact: string;
  rootCause: string;
  countermeasure: string;
  metricToTrack: string;
  priority: "do-now" | "do-next" | "do-later" | "not-yet";
  relatedServiceId?: ServiceId;
};

export type GrowthStrength = {
  categoryId: GrowthScoreCategoryId;
  what: string;
  evidence: string;
  whyItMatters: string;
  howToLeverage: string;
  scalable: boolean;
  ownerDependent: boolean;
};

export type GrowthCategoryResult = {
  categoryId: GrowthScoreCategoryId;
  label: string;
  rawScore: number;
  weightedScore: number;
  maximumScore: number;
  normalizedScore: number;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  questionsAnswered: number;
  questionsSkipped: number;
  questionsUnknown: number;
  supportingEvidence: string[];
  positiveIndicators: string[];
  riskIndicators: string[];
  strengths: GrowthStrength[];
  weaknesses: GrowthWeakness[];
  growthGaps: string[];
  recommendedActions: string[];
  relatedServices: ServiceId[];
};

export type GrowthScoreBand = {
  min: number;
  max: number;
  label: string;
  message: string;
};

export type GrowthScoreResult = {
  mode: "quick" | "full";
  generatedAt: number;
  /** Null when overallConfidenceLabel is "insufficient" — never a misleading number. */
  overallScore: number | null;
  scoreBand: GrowthScoreBand | null;
  overallConfidence: number;
  overallConfidenceLabel: ConfidenceLabel;
  categoriesEvaluated: GrowthScoreCategoryId[];
  categoriesMissing: GrowthScoreCategoryId[];
  categoryResults: GrowthCategoryResult[];
  strongestCategory: GrowthScoreCategoryId | null;
  weakestCategory: GrowthScoreCategoryId | null;
  highestPriorityGap: string | null;
  topStrengths: GrowthStrength[];
  topWeaknesses: GrowthWeakness[];
  quickWins: string[];
  doNow: string[];
  doNext: string[];
  doLater: string[];
  notYet: string[];
  thirtyDayPlan: string[];
  ninetyDayPlan: string[];
  metricsToTrack: string[];
  recommendedServices: ServiceRecommendation[];
  recommendedPlan: PlanRecommendation | null;
  immediateNextAction: string;
  contradictionsDetected: string[];
  infoUsed: string[];
  infoMissing: string[];
  confidenceExplanation: string;
};

// -----------------------------------------------------------------------
// Dev-grade owner authentication & audit logging
// -----------------------------------------------------------------------

export type AdminRole = "owner" | "admin" | "staff";

export type AdminSessionPayload = {
  role: AdminRole;
  issuedAt: number;
  expiresAt: number;
};

export type AuditAction =
  | "admin_login"
  | "admin_login_failed"
  | "admin_logout"
  | "lead_viewed"
  | "lead_exported"
  | "lead_updated"
  | "lead_deleted"
  | "consent_changed"
  | "role_changed"
  | "follow_up_status_changed";

export type AuditEvent = {
  id: string;
  action: AuditAction;
  actorRole: AdminRole | "unknown";
  leadId?: string;
  detail?: string;
  timestamp: number;
};
