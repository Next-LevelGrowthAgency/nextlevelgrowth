import { isEmailDeliveryActive, isDurableStorageActive } from "@/lib/growth-coach/adapters";
import { isAnthropicConfigured } from "@/lib/growth-coach/ai/config";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { isTurnstileConfigured } from "@/lib/growth-coach/spam-protection";

/**
 * Single source of truth for "what's configured" — the admin diagnostics
 * page (src/app/admin/(protected)/diagnostics/page.tsx) is a thin render
 * of this. Never returns a secret VALUE, only booleans/short status
 * strings — safe to render on an authenticated admin page and safe to log.
 */
export type EnvironmentStatus = {
  siteUrlConfigured: boolean;
  resendConfigured: boolean;
  senderAddressConfigured: boolean;
  databaseConfigured: boolean;
  authConfigured: boolean;
  turnstileConfigured: boolean;
  /** Whether the Growth Coach's open-ended replies are backed by a real Claude call (see src/lib/growth-coach/ai/) — false means every free-text reply falls back to the scripted engine. */
  growthCoachAiConfigured: boolean;
};

export function getEnvironmentStatus(): EnvironmentStatus {
  return {
    siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    resendConfigured: isEmailDeliveryActive(),
    senderAddressConfigured: Boolean(process.env.EMAIL_FROM_ADDRESS),
    databaseConfigured: isDurableStorageActive(),
    authConfigured: isSupabaseAuthConfigured(),
    turnstileConfigured: isTurnstileConfigured(),
    growthCoachAiConfigured: process.env.NEXT_PUBLIC_CHAT_ENABLED === "true" && isAnthropicConfigured(),
  };
}

/**
 * Live connectivity check — actually queries Supabase rather than just
 * checking env vars are set (a typo'd URL/key still "looks configured").
 * Best-effort: any failure is reported as a status string, never thrown.
 */
export async function checkDatabaseConnection(): Promise<{ ok: boolean; detail: string }> {
  if (!isDurableStorageActive()) return { ok: false, detail: "Not configured." };
  try {
    const { getLeadAdapter } = await import("@/lib/growth-coach/adapters");
    await getLeadAdapter().listLeads();
    return { ok: true, detail: "Connected — read a page of leads successfully." };
  } catch (error) {
    return { ok: false, detail: `Connection failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

export async function checkAuthMigrationStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!isSupabaseAuthConfigured()) return { ok: false, detail: "Not configured." };
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server-client");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) return { ok: false, detail: `"profiles" table not reachable — has migration 0003 been run? (${error.message})` };
    return { ok: true, detail: '"profiles" table reachable — migration 0003 appears to be applied.' };
  } catch (error) {
    return { ok: false, detail: `Check failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

/** Same live-connectivity pattern as checkAuthMigrationStatus, for the Stage 3 AI usage/budget tables. */
export async function checkAiUsageMigrationStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!isDurableStorageActive()) return { ok: false, detail: "Not configured." };
  try {
    const { getServiceRoleClient } = await import("@/lib/growth-coach/adapters/supabase-client");
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("ai_monthly_budget_usage").select("pool").limit(1);
    if (error) return { ok: false, detail: `"ai_monthly_budget_usage" table not reachable — has migration 0004 been run? (${error.message})` };
    return { ok: true, detail: "AI usage/budget tables reachable — migration 0004 appears to be applied." };
  } catch (error) {
    return { ok: false, detail: `Check failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

/** Same pattern, for the Stage 4 follow-up consent-audit-trail columns (hashed IP, user agent, terms version). */
export async function checkConsentAuditMigrationStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!isDurableStorageActive()) return { ok: false, detail: "Not configured." };
  try {
    const { getServiceRoleClient } = await import("@/lib/growth-coach/adapters/supabase-client");
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("growth_coach_leads").select("consent_ip_hash").limit(1);
    if (error) return { ok: false, detail: `"consent_ip_hash" column not reachable — has migration 0005 been run? (${error.message})` };
    return { ok: true, detail: "Consent audit-trail columns reachable — migration 0005 appears to be applied." };
  } catch (error) {
    return { ok: false, detail: `Check failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}

/** Same pattern, for the Stage 5 client-access request/approval columns on profiles. */
export async function checkClientAccessMigrationStatus(): Promise<{ ok: boolean; detail: string }> {
  if (!isSupabaseAuthConfigured()) return { ok: false, detail: "Not configured." };
  try {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server-client");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profiles").select("role_request_status").limit(1);
    if (error) return { ok: false, detail: `"role_request_status" column not reachable — has migration 0007 been run? (${error.message})` };
    return { ok: true, detail: "Client-access request columns reachable — migration 0007 appears to be applied." };
  } catch (error) {
    return { ok: false, detail: `Check failed: ${error instanceof Error ? error.message : "unknown error"}` };
  }
}
