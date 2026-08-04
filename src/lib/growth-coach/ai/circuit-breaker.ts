import { getAiUsageAdapter, getEmailAdapter, getLeadAdapter, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import type { AiUsagePool, AiUsageTier } from "@/lib/growth-coach/adapters/types";
import { buildAiBudgetAlertEmail } from "@/lib/growth-coach/email-templates";
import { siteConfig } from "@/lib/site-config";
import { getCurrentDayKey, getCurrentMonthKey, getDailyLimit, getMonthlyBudgetUsd, getPoolLabel } from "./budget-config";

/**
 * Policy layer sitting on top of AiUsageAdapter — the ONE place that
 * decides "is this request allowed to call the AI" (daily tier cap +
 * monthly cost circuit breaker) and "what happens after a successful
 * call" (persist usage, roll it into the monthly total, fire an alert
 * email at 80%/100%). The route handler (/api/growth-coach/chat) calls
 * these three functions and nothing else — it never touches the adapter
 * or the budget math directly, so this stays the single source of truth
 * both for enforcement and for Stage 6 regression tests.
 */

export type DailyLimitCheck = { allowed: true; count: number; limit: number } | { allowed: false; count: number; limit: number };

/** Atomically increments today's count for this tier/identity and reports whether it's still within the daily cap. Always increments — even a request that ends up denied counts as an attempt, matching standard rate-limit semantics and keeping this race-free. */
export async function checkAndConsumeDailyTierLimit(tier: AiUsageTier, identityKey: string): Promise<DailyLimitCheck> {
  const limit = getDailyLimit(tier);
  const dayKey = getCurrentDayKey();
  const count = await getAiUsageAdapter().incrementDailyTierUsage(tier, identityKey, dayKey);
  return count > limit ? { allowed: false, count, limit } : { allowed: true, count, limit };
}

/** Read-only check: has this pool already hit its monthly ceiling? Checked BEFORE calling the AI so an already-exhausted pool never pays for another call. */
export async function isMonthlyBudgetExhausted(pool: AiUsagePool): Promise<boolean> {
  const state = await getAiUsageAdapter().getMonthlyBudgetState(pool, getCurrentMonthKey());
  return state.cumulativeCostUsd >= getMonthlyBudgetUsd(pool);
}

/**
 * Called once, after a successful AI call. Persists the usage event,
 * rolls the real cost into the pool's monthly total, and — if that
 * pushed the pool across the 80% or 100% line for the first time this
 * month — sends exactly one alert email per threshold (claimBudgetAlert
 * is the atomic guard against a double-send under concurrent requests).
 * Never throws: a tracking/alerting failure must not surface as a
 * failure of the AI reply that was already shown to the visitor.
 */
export async function recordUsageAndMaybeAlert(input: {
  tier: AiUsageTier;
  pool: AiUsagePool;
  userId: string | null;
  identityHash: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}): Promise<void> {
  const adapter = getAiUsageAdapter();
  const monthKey = getCurrentMonthKey();

  try {
    await adapter.recordUsageEvent({
      tier: input.tier,
      pool: input.pool,
      userId: input.userId,
      identityHash: input.identityHash,
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      estimatedCostUsd: input.estimatedCostUsd,
    });

    const budgetUsd = getMonthlyBudgetUsd(input.pool);
    const newTotal = await adapter.incrementMonthlyBudgetUsage(input.pool, monthKey, input.estimatedCostUsd);
    const ratio = newTotal / budgetUsd;

    // Checked independently (not else-if) so a single increment that jumps
    // straight past both lines at once — a tiny configured budget, or a
    // burst of concurrent requests — still sends both alerts, not just the
    // higher one. claimBudgetAlert makes each call idempotent per month.
    if (ratio >= 0.8) await maybeSendAlert(input.pool, monthKey, "80", newTotal, budgetUsd);
    if (ratio >= 1) await maybeSendAlert(input.pool, monthKey, "100", newTotal, budgetUsd);
  } catch (error) {
    console.error("[growth-coach-circuit-breaker] Failed to record usage / evaluate budget alert:", error instanceof Error ? error.message : error);
  }
}

async function maybeSendAlert(pool: AiUsagePool, monthKey: string, threshold: "80" | "100", cumulativeCostUsd: number, budgetUsd: number): Promise<void> {
  const claimed = await getAiUsageAdapter().claimBudgetAlert(pool, monthKey, threshold);
  if (!claimed) return; // another concurrent request already sent this one

  if (!isEmailDeliveryActive()) {
    console.info(`[growth-coach-circuit-breaker] ${getPoolLabel(pool)} pool crossed ${threshold}% of its ${monthKey} budget (email delivery not configured, alert not sent).`);
    return;
  }

  const recipient = process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email;
  const email = buildAiBudgetAlertEmail({ poolLabel: getPoolLabel(pool), threshold, cumulativeCostUsd, budgetUsd, monthKey });

  try {
    const result = await getEmailAdapter().sendTransactional({ to: recipient, subject: email.subject, body: email.text, html: email.html });
    await getLeadAdapter().recordEmailEvent({ leadId: null, emailType: "ai_budget_alert", recipient, status: "sent", providerMessageId: result.previewId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[growth-coach-circuit-breaker] Budget alert email failed:", message);
    await getLeadAdapter().recordEmailEvent({ leadId: null, emailType: "ai_budget_alert", recipient, status: "failed", errorMessage: message });
  }
}
