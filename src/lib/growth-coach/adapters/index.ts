import { localAiUsageAdapter } from "./ai-usage-local-mock";
import { supabaseAiUsageAdapter } from "./ai-usage-supabase";
import { consoleEmailAdapter, localLeadAdapter } from "./local-mock";
import { isResendConfigured, resendEmailAdapter } from "./resend";
import { isSupabaseConfigured, supabaseLeadAdapter } from "./supabase";
import type { AiUsageAdapter, EmailAdapter, LeadAdapter } from "./types";

/**
 * Single seam every route/page should import through instead of reaching
 * into a specific adapter file directly — keeps the "which provider is
 * active" decision in one place. Both factories fail safe: if the required
 * environment variables aren't set, the app keeps working exactly as it
 * does today (in-memory store, console-logged email) rather than crashing
 * or silently dropping data.
 */

export function getEmailAdapter(): EmailAdapter {
  return isResendConfigured() ? resendEmailAdapter : consoleEmailAdapter;
}

export function getLeadAdapter(): LeadAdapter {
  return isSupabaseConfigured() ? supabaseLeadAdapter : localLeadAdapter;
}

export function isEmailDeliveryActive(): boolean {
  return isResendConfigured();
}

export function isDurableStorageActive(): boolean {
  return isSupabaseConfigured();
}

export function getAiUsageAdapter(): AiUsageAdapter {
  return isSupabaseConfigured() ? supabaseAiUsageAdapter : localAiUsageAdapter;
}
