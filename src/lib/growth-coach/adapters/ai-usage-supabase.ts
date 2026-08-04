import { getServiceRoleClient, isSupabaseConfigured } from "./supabase-client";
import type { AiUsageAdapter } from "./types";

/**
 * PRODUCTION ADAPTER for AI usage tracking — active whenever Supabase is
 * configured (see isSupabaseConfigured() and ./index.ts's factory, which
 * falls back to ./ai-usage-local-mock.ts otherwise). Talks to the tables
 * and RPC functions created by
 * supabase/migrations/0004_ai_usage_and_budget.sql. The increments go
 * through Postgres functions rather than plain UPDATEs specifically so
 * concurrent requests can never lose a count/cost increment to a race —
 * see that migration file for why each function is written the way it is.
 */

export { isSupabaseConfigured };

export const supabaseAiUsageAdapter: AiUsageAdapter = {
  async incrementDailyTierUsage(tier, identityKey, dayKey) {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.rpc("increment_ai_daily_tier_usage", {
      p_tier: tier,
      p_identity_key: identityKey,
      p_day_key: dayKey,
    });
    if (error) throw new Error(`Supabase RPC increment_ai_daily_tier_usage failed: ${error.message}`);
    return data as number;
  },

  async getMonthlyBudgetState(pool, monthKey) {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("ai_monthly_budget_usage")
      .select("cumulative_cost_usd, alert_80_sent, alert_100_sent")
      .eq("pool", pool)
      .eq("month_key", monthKey)
      .maybeSingle();
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    if (!data) return { cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false };
    return {
      cumulativeCostUsd: Number(data.cumulative_cost_usd),
      alert80Sent: data.alert_80_sent,
      alert100Sent: data.alert_100_sent,
    };
  },

  async incrementMonthlyBudgetUsage(pool, monthKey, costDeltaUsd) {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.rpc("increment_ai_monthly_budget_usage", {
      p_pool: pool,
      p_month_key: monthKey,
      p_cost_delta: costDeltaUsd,
    });
    if (error) throw new Error(`Supabase RPC increment_ai_monthly_budget_usage failed: ${error.message}`);
    return Number(data);
  },

  async claimBudgetAlert(pool, monthKey, threshold) {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase.rpc("claim_ai_budget_alert", {
      p_pool: pool,
      p_month_key: monthKey,
      p_threshold: threshold,
    });
    if (error) throw new Error(`Supabase RPC claim_ai_budget_alert failed: ${error.message}`);
    return Boolean(data);
  },

  async recordUsageEvent(event) {
    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("ai_usage_events").insert({
      tier: event.tier,
      pool: event.pool,
      user_id: event.userId,
      identity_hash: event.identityHash,
      model: event.model,
      input_tokens: event.inputTokens,
      output_tokens: event.outputTokens,
      estimated_cost_usd: event.estimatedCostUsd,
    });
    if (error) {
      // Audit-log write only — never let a logging failure surface as a
      // failure of the AI response that already succeeded and was already
      // shown to the visitor (same rationale as recordEmailEvent in
      // supabase.ts).
      console.error("[ai-usage-supabase-adapter] Failed to record usage event:", error.message);
    }
  },
};
