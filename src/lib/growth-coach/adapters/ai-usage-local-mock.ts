import type { AiMonthlyBudgetState, AiUsageAdapter } from "./types";

/**
 * DEVELOPMENT-ONLY MOCK — in-memory only, resets on every server restart
 * and is NOT shared across serverless instances (same caveat as
 * local-mock.ts's lead/email store). Active whenever Supabase isn't
 * configured, so the daily tier limits and monthly circuit breaker still
 * function end-to-end in local dev, just without durability. See
 * ./ai-usage-supabase.ts for the production adapter and
 * supabase/migrations/0004_ai_usage_and_budget.sql for the real schema.
 *
 * Attached to `globalThis` for the same reason as local-mock.ts's store:
 * Next.js dev compiles Route Handlers and other module graphs separately,
 * so a plain module-level Map could silently produce disconnected
 * instances between requests.
 */
type MockUsageStore = {
  dailyTierUsage: Map<string, number>; // key: `${tier}:${identityKey}:${dayKey}`
  monthlyBudget: Map<string, AiMonthlyBudgetState>; // key: `${pool}:${monthKey}`
};
const globalForMockUsageStore = globalThis as unknown as { __growthCoachAiUsageMockStore?: MockUsageStore };
const mockUsageStore: MockUsageStore = globalForMockUsageStore.__growthCoachAiUsageMockStore ?? {
  dailyTierUsage: new Map(),
  monthlyBudget: new Map(),
};
globalForMockUsageStore.__growthCoachAiUsageMockStore = mockUsageStore;

export const localAiUsageAdapter: AiUsageAdapter = {
  async incrementDailyTierUsage(tier, identityKey, dayKey) {
    const key = `${tier}:${identityKey}:${dayKey}`;
    const next = (mockUsageStore.dailyTierUsage.get(key) ?? 0) + 1;
    mockUsageStore.dailyTierUsage.set(key, next);
    return next;
  },

  async getMonthlyBudgetState(pool, monthKey) {
    const key = `${pool}:${monthKey}`;
    return mockUsageStore.monthlyBudget.get(key) ?? { cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false };
  },

  async incrementMonthlyBudgetUsage(pool, monthKey, costDeltaUsd) {
    const key = `${pool}:${monthKey}`;
    const current = mockUsageStore.monthlyBudget.get(key) ?? { cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false };
    const next = { ...current, cumulativeCostUsd: current.cumulativeCostUsd + costDeltaUsd };
    mockUsageStore.monthlyBudget.set(key, next);
    return next.cumulativeCostUsd;
  },

  async claimBudgetAlert(pool, monthKey, threshold) {
    const key = `${pool}:${monthKey}`;
    const current = mockUsageStore.monthlyBudget.get(key) ?? { cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false };
    const flag = threshold === "80" ? "alert80Sent" : "alert100Sent";
    if (current[flag]) return false;
    mockUsageStore.monthlyBudget.set(key, { ...current, [flag]: true });
    return true;
  },

  async recordUsageEvent() {
    // Audit-log-only in the mock adapter — nothing reads it back locally
    // (there's no admin usage-log view in this stage), so there's nothing
    // useful to store. The counters above are what actually drive
    // enforcement, and both are tracked regardless of this no-op.
  },
};
