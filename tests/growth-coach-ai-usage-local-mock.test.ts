import { describe, expect, it } from "vitest";
import { localAiUsageAdapter } from "@/lib/growth-coach/adapters/ai-usage-local-mock";

/**
 * The in-memory mock adapter is what actually drives enforcement in local
 * dev/test (Supabase isn't configured in the automated test environment),
 * so its increment/claim semantics need to be correct on their own merits,
 * not just "matches the interface". Each test uses a unique key so state
 * left over from other tests (the store is a module-level singleton, same
 * as local-mock.ts's lead store) never leaks between assertions.
 */
describe("localAiUsageAdapter", () => {
  it("incrementDailyTierUsage counts up per (tier, identity, day) and isolates other keys", async () => {
    const day = "2026-08-04-a";
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "id-a", day)).toBe(1);
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "id-a", day)).toBe(2);
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "id-a", day)).toBe(3);
    // A different identity, tier, or day starts its own counter at 1.
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "id-b", day)).toBe(1);
    expect(await localAiUsageAdapter.incrementDailyTierUsage("free", "id-a", day)).toBe(1);
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "id-a", "2026-08-05-a")).toBe(1);
  });

  it("getMonthlyBudgetState defaults to zero/false for a never-seen pool+month", async () => {
    const state = await localAiUsageAdapter.getMonthlyBudgetState("free", "2026-08-b");
    expect(state).toEqual({ cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false });
  });

  it("incrementMonthlyBudgetUsage accumulates cost across calls and keeps pools independent", async () => {
    const month = "2026-08-c";
    expect(await localAiUsageAdapter.incrementMonthlyBudgetUsage("free", month, 10)).toBeCloseTo(10, 6);
    expect(await localAiUsageAdapter.incrementMonthlyBudgetUsage("free", month, 5.5)).toBeCloseTo(15.5, 6);
    // 'client' pool for the same month is untouched by 'free' pool writes.
    const clientState = await localAiUsageAdapter.getMonthlyBudgetState("client", month);
    expect(clientState.cumulativeCostUsd).toBe(0);
  });

  it("claimBudgetAlert returns true exactly once per (pool, month, threshold) and false on every subsequent call", async () => {
    const month = "2026-08-d";
    await localAiUsageAdapter.incrementMonthlyBudgetUsage("free", month, 80);
    expect(await localAiUsageAdapter.claimBudgetAlert("free", month, "80")).toBe(true);
    expect(await localAiUsageAdapter.claimBudgetAlert("free", month, "80")).toBe(false);
    expect(await localAiUsageAdapter.claimBudgetAlert("free", month, "80")).toBe(false);
    // The 100% threshold is claimed independently of the 80% one.
    expect(await localAiUsageAdapter.claimBudgetAlert("free", month, "100")).toBe(true);
    expect(await localAiUsageAdapter.claimBudgetAlert("free", month, "100")).toBe(false);
  });

  it("claimBudgetAlert does not clobber the pool's accumulated cost", async () => {
    const month = "2026-08-e";
    await localAiUsageAdapter.incrementMonthlyBudgetUsage("client", month, 42);
    await localAiUsageAdapter.claimBudgetAlert("client", month, "80");
    const state = await localAiUsageAdapter.getMonthlyBudgetState("client", month);
    expect(state.cumulativeCostUsd).toBe(42);
    expect(state.alert80Sent).toBe(true);
  });

  it("recordUsageEvent never throws (no-op audit log in the mock)", async () => {
    await expect(
      localAiUsageAdapter.recordUsageEvent({
        tier: "guest",
        pool: "free",
        userId: null,
        identityHash: "abc123",
        model: "claude-haiku-4-5-20251001",
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 0.001,
      })
    ).resolves.toBeUndefined();
  });
});

describe("localAiUsageAdapter — no cross-tier interference on daily limits", () => {
  it("guest and client counters for the same identity string on the same day are independent", async () => {
    const day = "2026-08-04-f";
    expect(await localAiUsageAdapter.incrementDailyTierUsage("guest", "shared-key", day)).toBe(1);
    expect(await localAiUsageAdapter.incrementDailyTierUsage("client", "shared-key", day)).toBe(1);
  });
});
