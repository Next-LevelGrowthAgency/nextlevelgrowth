import { isEmailDeliveryActive, isDurableStorageActive } from "@/lib/growth-coach/adapters";
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
  aiChatConfigured: boolean;
};

export function getEnvironmentStatus(): EnvironmentStatus {
  return {
    siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    resendConfigured: isEmailDeliveryActive(),
    senderAddressConfigured: Boolean(process.env.EMAIL_FROM_ADDRESS),
    databaseConfigured: isDurableStorageActive(),
    authConfigured: isSupabaseAuthConfigured(),
    turnstileConfigured: isTurnstileConfigured(),
    aiChatConfigured: process.env.NEXT_PUBLIC_CHAT_ENABLED === "true" && Boolean(process.env.AI_CHAT_PROVIDER_API_KEY),
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
