import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LeadProfile, LeadQualification } from "@/types";
import type { LeadAdapter, LeadInput } from "./types";

/**
 * PRODUCTION DATABASE ADAPTER — active only once NEXT_PUBLIC_SUPABASE_URL
 * and SUPABASE_SERVICE_ROLE_KEY are both set (see isSupabaseConfigured()
 * and ./index.ts's factory, which falls back to the in-memory local-mock
 * adapter otherwise so the app never silently loses submissions while
 * unconfigured).
 *
 * Talks to the `growth_coach_leads` table created by
 * supabase/migrations/0001_growth_coach_leads.sql — see that file (and
 * 0002/0003) for the schema and RLS design. Always uses the SERVICE ROLE
 * key (server-only, bypasses RLS by design); this module must never be
 * imported into client-side code. The project URL itself is not a secret
 * (it's the same NEXT_PUBLIC_SUPABASE_URL the browser client in
 * src/lib/supabase/browser-client.ts uses) — only the service-role key is.
 */

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set. See .env.example.");
  }
  if (!client) client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// -----------------------------------------------------------------------
// LeadProfile <-> growth_coach_leads row mapping
// -----------------------------------------------------------------------

// Supabase's untyped client returns loosely-shaped rows; `any` here is
// intentional and localized to this mapping layer.
type Row = Record<string, any>;

function toRow(input: Partial<LeadInput>): Row {
  return {
    session_id: input.sessionId,
    source: input.source,
    campaign_source: input.campaignSource,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    preferred_contact_method: input.preferredContactMethod,
    business_name: input.businessName,
    industry: input.industry,
    city: input.city,
    state: input.state,
    service_area: input.serviceArea,
    website_url: input.websiteUrl,
    years_in_business: input.yearsInBusiness,
    business_stage: input.businessStage,
    team_size: input.teamSize,
    primary_goal: input.primaryGoal,
    primary_challenge: input.primaryChallenge,
    marketing_channels: input.marketingChannels,
    monthly_lead_volume: input.monthlyLeadVolume,
    lead_response_process: input.leadResponseProcess,
    website_status: input.websiteStatus,
    google_business_profile_status: input.googleBusinessProfileStatus,
    review_process: input.reviewProcess,
    revenue_range: input.revenueRange,
    marketing_budget_range: input.marketingBudgetRange,
    weekly_time_available: input.weeklyTimeAvailable,
    desired_timeline: input.desiredTimeline,
    personal_constraints: input.personalConstraints,
    service_interests: input.serviceInterests ?? null,
    recommended_services: input.recommendedServices ?? null,
    recommended_plan: input.recommendedPlan ?? null,
    conversation_summary: input.conversationSummary,
    message: input.message,
    user_id: input.userId ?? null,
    submission_payload: input.submissionPayload ?? null,
    source_page: input.sourcePage,
    referrer: input.referrer,
    utm_source: input.utmSource,
    utm_medium: input.utmMedium,
    utm_campaign: input.utmCampaign,
    consent_language_version: input.consentLanguageVersion,
    current_state: input.currentState,
    ideal_state: input.idealState,
    growth_gap: input.growthGap,
    quick_wins: input.quickWins ?? null,
    thirty_day_plan: input.thirtyDayPlan ?? null,
    ninety_day_roadmap: input.ninetyDayRoadmap ?? null,
    next_action: input.nextAction,
    lead_qualification_level: input.leadQualificationLevel,
    consultation_requested: input.consultationRequested ?? false,
    ninety_day_plan_requested: input.ninetyDayPlanRequested ?? false,
    growth_score: input.growthScore ?? null,
    growth_score_confidence: input.growthScoreConfidence,
    growth_score_band: input.growthScoreBand,
    biggest_growth_gap: input.biggestGrowthGap,
    growth_category_snapshot: input.growthCategorySnapshot ?? null,
    consent_to_save_report: input.consentToSaveReport ?? false,
    consent_to_email_follow_up: input.consentToEmailFollowUp ?? false,
    consent_to_phone_call: input.consentToPhoneCall ?? false,
    consent_to_text_message: input.consentToTextMessage ?? false,
    consent_to_marketing: input.consentToMarketing ?? false,
    report_consent_timestamp: toIso(input.reportConsentTimestamp),
    contact_consent_timestamp: toIso(input.contactConsentTimestamp),
    marketing_consent_timestamp: toIso(input.marketingConsentTimestamp),
    follow_up_status: input.followUpStatus ?? "new",
    assigned_owner: input.assignedOwner,
    internal_notes: input.internalNotes,
  };
}

function toIso(ms: number | undefined): string | undefined {
  return ms === undefined ? undefined : new Date(ms).toISOString();
}

function fromIso(iso: string | null | undefined): number | undefined {
  return iso ? new Date(iso).getTime() : undefined;
}

function fromRow(row: Row): LeadProfile {
  return {
    id: row.id,
    sessionId: row.session_id,
    source: row.source,
    campaignSource: row.campaign_source ?? undefined,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    preferredContactMethod: row.preferred_contact_method ?? undefined,
    businessName: row.business_name ?? undefined,
    industry: row.industry ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    serviceArea: row.service_area ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    yearsInBusiness: row.years_in_business ?? undefined,
    businessStage: row.business_stage ?? undefined,
    teamSize: row.team_size ?? undefined,
    primaryGoal: row.primary_goal ?? undefined,
    primaryChallenge: row.primary_challenge ?? undefined,
    marketingChannels: row.marketing_channels ?? undefined,
    monthlyLeadVolume: row.monthly_lead_volume ?? undefined,
    leadResponseProcess: row.lead_response_process ?? undefined,
    websiteStatus: row.website_status ?? undefined,
    googleBusinessProfileStatus: row.google_business_profile_status ?? undefined,
    reviewProcess: row.review_process ?? undefined,
    revenueRange: row.revenue_range ?? undefined,
    marketingBudgetRange: row.marketing_budget_range ?? undefined,
    weeklyTimeAvailable: row.weekly_time_available ?? undefined,
    desiredTimeline: row.desired_timeline ?? undefined,
    personalConstraints: row.personal_constraints ?? undefined,
    message: row.message ?? undefined,
    userId: row.user_id ?? undefined,
    submissionPayload: row.submission_payload ?? undefined,
    sourcePage: row.source_page ?? undefined,
    referrer: row.referrer ?? undefined,
    utmSource: row.utm_source ?? undefined,
    utmMedium: row.utm_medium ?? undefined,
    utmCampaign: row.utm_campaign ?? undefined,
    consentLanguageVersion: row.consent_language_version ?? undefined,
    serviceInterests: row.service_interests ?? undefined,
    recommendedServices: row.recommended_services ?? undefined,
    recommendedPlan: row.recommended_plan ?? undefined,
    conversationSummary: row.conversation_summary ?? undefined,
    currentState: row.current_state ?? undefined,
    idealState: row.ideal_state ?? undefined,
    growthGap: row.growth_gap ?? undefined,
    quickWins: row.quick_wins ?? undefined,
    thirtyDayPlan: row.thirty_day_plan ?? undefined,
    ninetyDayRoadmap: row.ninety_day_roadmap ?? undefined,
    nextAction: row.next_action ?? undefined,
    leadQualificationLevel: (row.lead_qualification_level as LeadQualification) ?? undefined,
    consultationRequested: row.consultation_requested ?? false,
    ninetyDayPlanRequested: row.ninety_day_plan_requested ?? false,
    growthScore: row.growth_score,
    growthScoreConfidence: row.growth_score_confidence ?? undefined,
    growthScoreBand: row.growth_score_band ?? undefined,
    biggestGrowthGap: row.biggest_growth_gap ?? undefined,
    growthCategorySnapshot: row.growth_category_snapshot ?? undefined,
    consentToSaveReport: row.consent_to_save_report ?? false,
    consentToContact: Boolean(row.consent_to_email_follow_up || row.consent_to_phone_call || row.consent_to_text_message),
    consentToEmailFollowUp: row.consent_to_email_follow_up ?? false,
    consentToPhoneCall: row.consent_to_phone_call ?? false,
    consentToTextMessage: row.consent_to_text_message ?? false,
    consentToMarketing: row.consent_to_marketing ?? false,
    reportConsentTimestamp: fromIso(row.report_consent_timestamp),
    contactConsentTimestamp: fromIso(row.contact_consent_timestamp),
    marketingConsentTimestamp: fromIso(row.marketing_consent_timestamp),
    followUpStatus: row.follow_up_status ?? "new",
    assignedOwner: row.assigned_owner ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    createdAt: fromIso(row.created_at) ?? Date.now(),
    updatedAt: fromIso(row.updated_at) ?? Date.now(),
  };
}

const TABLE = "growth_coach_leads";

export const supabaseLeadAdapter: LeadAdapter = {
  async createLead(input: LeadInput) {
    const supabase = getClient();

    // Duplicate-submission guard, same 5-minute window as local-mock.ts.
    if (input.email) {
      const { data: existing } = await supabase
        .from(TABLE)
        .select("*")
        .eq("email", input.email)
        .gte("created_at", new Date(Date.now() - 5 * 60_000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from(TABLE).update(toRow(input)).eq("id", existing.id).select("*").single();
        if (error) throw new Error(`Supabase update failed: ${error.message}`);
        return fromRow(data);
      }
    }

    const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select("*").single();
    if (error) throw new Error(`Supabase insert failed: ${error.message}`);
    return fromRow(data);
  },

  async updateLead(id, patch) {
    const supabase = getClient();
    const { data, error } = await supabase.from(TABLE).update(toRow(patch)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return data ? fromRow(data) : null;
  },

  async getLead(id) {
    const supabase = getClient();
    const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    return data ? fromRow(data) : null;
  },

  async listLeads() {
    const supabase = getClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    return (data ?? []).map(fromRow);
  },

  async recordConsent(id, consent, timestamp) {
    const patch: Record<string, unknown> = {};
    if (consent.saveReport !== undefined) {
      patch.consent_to_save_report = consent.saveReport;
      patch.report_consent_timestamp = new Date(timestamp).toISOString();
    }
    if (consent.emailFollowUp !== undefined || consent.phoneCall !== undefined || consent.textMessage !== undefined) {
      if (consent.emailFollowUp !== undefined) patch.consent_to_email_follow_up = consent.emailFollowUp;
      if (consent.phoneCall !== undefined) patch.consent_to_phone_call = consent.phoneCall;
      if (consent.textMessage !== undefined) patch.consent_to_text_message = consent.textMessage;
      patch.contact_consent_timestamp = new Date(timestamp).toISOString();
    }
    if (consent.marketing !== undefined) {
      patch.consent_to_marketing = consent.marketing;
      patch.marketing_consent_timestamp = new Date(timestamp).toISOString();
    }
    const supabase = getClient();
    const { data, error } = await supabase.from(TABLE).update(patch).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return data ? fromRow(data) : null;
  },

  async saveReport(id, reportSummary) {
    return supabaseLeadAdapter.updateLead(id, { conversationSummary: reportSummary });
  },

  async saveConversationSummary(id, summary) {
    return supabaseLeadAdapter.updateLead(id, { conversationSummary: summary });
  },

  async updateQualification(id, level) {
    return supabaseLeadAdapter.updateLead(id, { leadQualificationLevel: level });
  },

  async updateFollowUpStatus(id, status) {
    return supabaseLeadAdapter.updateLead(id, { followUpStatus: status });
  },

  async recordEmailSubscription(id, subscribed, timestamp) {
    return supabaseLeadAdapter.updateLead(id, { consentToMarketing: subscribed, marketingConsentTimestamp: timestamp });
  },

  async recordSource(id, source, campaignSource) {
    return supabaseLeadAdapter.updateLead(id, { source, campaignSource });
  },

  async requestDeletion(id) {
    const supabase = getClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    return !error;
  },

  async exportLead(id) {
    return supabaseLeadAdapter.getLead(id);
  },

  async recordEmailEvent(event) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("growth_coach_email_events")
      .insert({
        lead_id: event.leadId,
        email_type: event.emailType,
        recipient: event.recipient,
        status: event.status,
        provider_message_id: event.providerMessageId ?? null,
        error_message: event.errorMessage ?? null,
      })
      .select("*")
      .single();
    if (error) {
      // Email-event logging is best-effort observability, not the primary
      // write — never let a logging failure surface as a request failure.
      console.error("[supabase-adapter] Failed to record email event:", error.message);
      return {
        id: `unrecorded-${Date.now()}`,
        leadId: event.leadId,
        emailType: event.emailType,
        recipient: event.recipient,
        status: event.status,
        providerMessageId: event.providerMessageId,
        errorMessage: event.errorMessage,
        createdAt: Date.now(),
      };
    }
    return {
      id: data.id,
      leadId: data.lead_id,
      emailType: data.email_type,
      recipient: data.recipient,
      status: data.status,
      providerMessageId: data.provider_message_id ?? undefined,
      errorMessage: data.error_message ?? undefined,
      createdAt: fromIso(data.created_at) ?? Date.now(),
    };
  },

  async saveConversationTranscript(input) {
    const supabase = getClient();
    const { error } = await supabase.from("growth_coach_conversations").upsert(
      {
        lead_id: input.leadId,
        user_id: input.userId ?? null,
        business_path: input.businessPath,
        response_depth: input.responseDepth,
        summary: input.summary,
        messages: input.messages,
      },
      { onConflict: "lead_id" }
    );
    if (error) {
      console.error("[supabase-adapter] Failed to save conversation transcript:", error.message);
    }
  },

  async listEmailEvents(limit = 100) {
    const supabase = getClient();
    const { data, error } = await supabase.from("growth_coach_email_events").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id,
      leadId: row.lead_id,
      emailType: row.email_type,
      recipient: row.recipient,
      status: row.status,
      providerMessageId: row.provider_message_id ?? undefined,
      errorMessage: row.error_message ?? undefined,
      createdAt: fromIso(row.created_at) ?? Date.now(),
    }));
  },

  async getConversationTranscript(leadId) {
    const supabase = getClient();
    const { data, error } = await supabase.from("growth_coach_conversations").select("*").eq("lead_id", leadId).maybeSingle();
    if (error || !data) return null;
    return { messages: data.messages ?? [], businessPath: data.business_path ?? null, responseDepth: data.response_depth ?? null };
  },
};
