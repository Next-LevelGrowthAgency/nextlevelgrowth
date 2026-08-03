import type { BusinessGrowthReport, CoachContext, LeadProfile, LeadQualification, OwnerLeadSummary } from "@/types";
import type { LeadInput } from "./adapters/types";

export type LeadFormValues = {
  firstName: string;
  email: string;
  businessName?: string;
  cityState?: string;
  websiteUrl?: string;
  phone?: string;
  preferredContactMethod?: "Email" | "Phone" | "Text";
  consentToSaveReport: boolean;
  consentToEmailFollowUp: boolean;
  consentToPhoneCall: boolean;
  consentToTextMessage: boolean;
  consentToMarketing: boolean;
  consultationRequested?: boolean;
};

/**
 * Combines what the visitor just typed into the lead form with what the
 * coach already learned during the conversation (context) and the report
 * just generated — so the owner-facing record reflects the whole session,
 * not just the three fields on the form.
 */
/** A raw conversational description ("I run a bakery in Austin...") isn't a business name — only use it as a fallback when it actually looks like one. */
function looksLikeAName(text: string | null | undefined): text is string {
  return !!text && text.length < 60 && !/[.?!]/.test(text);
}

export function buildLeadInput(
  form: LeadFormValues,
  report: BusinessGrowthReport,
  context: CoachContext,
  sessionId: string
): LeadInput {
  const now = Date.now();
  const [city, state] = (form.cityState ?? "").split(",").map((part) => part.trim());

  const input: LeadInput = {
    sessionId,
    source: "growth-coach",

    firstName: form.firstName,
    email: form.email,
    businessName: form.businessName || (looksLikeAName(report.businessName) ? report.businessName : undefined),
    city: city || undefined,
    state: state || undefined,
    websiteUrl: form.websiteUrl || undefined,
    phone: form.phone || undefined,
    preferredContactMethod: form.preferredContactMethod,

    primaryGoal: context.primaryGoal ?? undefined,
    weeklyTimeAvailable: context.weeklyHours ?? undefined,

    recommendedServices: report.recommendedServices,
    recommendedPlan: report.recommendedPlan,

    growthScore: report.growthScore?.overallScore ?? null,
    growthScoreConfidence: report.growthScore?.overallConfidenceLabel,
    growthScoreBand: report.growthScore?.scoreBand?.label,
    biggestGrowthGap: report.growthScore?.highestPriorityGap ?? undefined,
    growthCategorySnapshot: report.growthScore?.categoryResults
      .filter((c) => c.questionsAnswered > 0)
      .map((c) => ({ categoryId: c.categoryId, label: c.label, score: Math.round(c.normalizedScore) })),

    currentState: report.currentState,
    idealState: report.idealState,
    growthGap: report.growthGap,
    quickWins: report.quickWins,
    thirtyDayPlan: report.thirtyDayPlan,
    ninetyDayRoadmap: report.ninetyDayRoadmap,
    nextAction: report.nextAction,
    conversationSummary: report.executiveSummary,

    consultationRequested: form.consultationRequested ?? false,
    ninetyDayPlanRequested: context.ninetyDayPlanRequested,

    consentToSaveReport: form.consentToSaveReport,
    consentToEmailFollowUp: form.consentToEmailFollowUp,
    consentToPhoneCall: form.consentToPhoneCall,
    consentToTextMessage: form.consentToTextMessage,
    consentToContact: form.consentToEmailFollowUp || form.consentToPhoneCall || form.consentToTextMessage,
    consentToMarketing: form.consentToMarketing,
    reportConsentTimestamp: form.consentToSaveReport ? now : undefined,
    contactConsentTimestamp: form.consentToEmailFollowUp || form.consentToPhoneCall || form.consentToTextMessage ? now : undefined,
    marketingConsentTimestamp: form.consentToMarketing ? now : undefined,

    followUpStatus: "new",
  };

  input.leadQualificationLevel = qualifyLead(input);
  return input;
}

/**
 * Transparent, rule-based qualification — never blocks continued coaching
 * for a visitor who scores low, and never shown to the visitor themselves.
 */
export function qualifyLead(input: Pick<LeadInput, "recommendedServices" | "consentToContact" | "consultationRequested">): LeadQualification {
  const serviceCount = input.recommendedServices?.length ?? 0;
  if (serviceCount === 0) return "not-ready-yet";
  if (input.consultationRequested && input.consentToContact) return "high-priority-follow-up";
  if (input.consentToContact && serviceCount >= 2) return "qualified-opportunity";
  if (serviceCount >= 1) return "developing-need";
  return "exploring";
}

const FOLLOW_UP_APPROACH: Record<LeadQualification, string> = {
  "high-priority-follow-up": "Reach out within 24 hours via their preferred contact method. They've explicitly asked for a conversation.",
  "qualified-opportunity": "Follow up within a few days with a specific, low-pressure next step tied to their top recommendation.",
  "developing-need": "Light-touch follow-up: share value first; they haven't asked for direct contact yet.",
  exploring: "No outbound contact unless marketing consent was given. Let the report speak for itself for now.",
  "not-ready-yet": "Do not prioritize sales follow-up; if marketing consent exists, keep them in educational content only.",
};

export function buildOwnerSummary(lead: LeadProfile): OwnerLeadSummary {
  const qualification = lead.leadQualificationLevel ?? "exploring";
  return {
    leadId: lead.id,
    name: [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "(name not provided)",
    followUpStatus: lead.followUpStatus ?? "new",
    email: lead.email ?? "(no email on file)",
    phone: lead.phone,
    preferredContactMethod: lead.preferredContactMethod,
    businessName: lead.businessName,
    industry: lead.industry,
    location: [lead.city, lead.state, lead.serviceArea].filter(Boolean).join(", ") || undefined,
    website: lead.websiteUrl,
    businessStage: lead.businessStage,
    teamSize: lead.teamSize,
    primaryChallenge: lead.primaryChallenge,
    primaryGoal: lead.primaryGoal,
    constraints: lead.personalConstraints,
    timeline: lead.desiredTimeline,
    marketingChannels: lead.marketingChannels,
    leadVolume: lead.monthlyLeadVolume,
    revenueOrBudget: lead.revenueRange ?? lead.marketingBudgetRange,
    servicesOfInterest: lead.serviceInterests,
    recommendedServices: (lead.recommendedServices ?? []).map((s) => s.name),
    recommendedPlan: lead.recommendedPlan?.name ?? "Not yet determined",
    qualification,
    growthScore: lead.growthScore,
    growthScoreConfidence: lead.growthScoreConfidence,
    growthScoreBand: lead.growthScoreBand,
    biggestGrowthGap: lead.biggestGrowthGap,
    growthCategorySnapshot: lead.growthCategorySnapshot,
    respectfulFollowUpNote: "Approach follow-up with the same tone the coach used: direct, encouraging, never pressuring, especially if they declined anything during the session.",
    reportSummary: lead.conversationSummary ?? "No summary captured.",
    nextAction: lead.nextAction ?? "Review the full session context before reaching out.",
    consultationRequested: lead.consultationRequested ?? false,
    ninetyDayPlanRequested: lead.ninetyDayPlanRequested ?? false,
    consent: {
      saveReport: lead.consentToSaveReport,
      contact: lead.consentToContact,
      emailFollowUp: lead.consentToEmailFollowUp ?? false,
      phoneCall: lead.consentToPhoneCall ?? false,
      textMessage: lead.consentToTextMessage ?? false,
      marketing: lead.consentToMarketing,
    },
    consentTimestamps: {
      report: lead.reportConsentTimestamp,
      contact: lead.contactConsentTimestamp,
      marketing: lead.marketingConsentTimestamp,
    },
    suggestedFollowUpApproach: FOLLOW_UP_APPROACH[qualification],
  };
}
