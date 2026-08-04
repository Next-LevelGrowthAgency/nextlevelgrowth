import { createHash } from "node:crypto";
import { getCurrentUserRoleInfo } from "@/lib/auth/portal-session";
import type { AiUsagePool, AiUsageTier } from "@/lib/growth-coach/adapters/types";

/**
 * Resolves which AI usage tier/budget pool a request belongs to. Server-only
 * (touches Supabase Auth via next/headers cookies — never imported by a
 * "use client" component). The mapping is intentionally simple and lives in
 * exactly one place so the daily-limit check, the budget pool, and any
 * future admin reporting can never disagree about it:
 *   - not signed in                    -> guest, 'free' pool
 *   - signed in, role !== 'client'     -> free,  'free' pool
 *   - signed in, role === 'client'     -> client,'client' pool
 */
export type RequestTier = {
  tier: AiUsageTier;
  pool: AiUsagePool;
  /** Supabase user id for signed-in visitors, or a hashed IP for guests — never a raw IP (see hashGuestIdentity). */
  identityKey: string;
  /** Set only for signed-in visitors — used for ai_usage_events.user_id, never for guests. */
  userId: string | null;
  /** Set only for guests — used for ai_usage_events.identity_hash. */
  identityHash: string | null;
};

/**
 * A guest's daily-limit identity needs to be a stable-but-not-directly-PII
 * key, so it's a SHA-256 hash of their IP rather than the raw address —
 * consistent with this codebase's general privacy-conscious posture
 * (analytics events avoid PII; see track() in src/lib/growth-coach/analytics.ts). It's
 * still just a pseudonym for the IP, not real anonymization, which is fine
 * here since it exists purely to count messages per day, not to identify
 * anyone.
 */
export function hashGuestIdentity(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function resolveRequestTier(ip: string): Promise<RequestTier> {
  const info = await getCurrentUserRoleInfo();

  if (!info) {
    const identityHash = hashGuestIdentity(ip);
    return { tier: "guest", pool: "free", identityKey: identityHash, userId: null, identityHash };
  }

  if (info.role === "client") {
    return { tier: "client", pool: "client", identityKey: info.id, userId: info.id, identityHash: null };
  }

  return { tier: "free", pool: "free", identityKey: info.id, userId: info.id, identityHash: null };
}
