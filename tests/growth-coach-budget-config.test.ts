import { afterEach, describe, expect, it, vi } from "vitest";

describe("budget-config — timezone-aware day/month keys", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to America/New_York when AI_BUDGET_TIMEZONE is unset", async () => {
    vi.stubEnv("AI_BUDGET_TIMEZONE", "");
    const { getBudgetTimezone } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getBudgetTimezone()).toBe("America/New_York");
  });

  it("honors an AI_BUDGET_TIMEZONE override", async () => {
    vi.stubEnv("AI_BUDGET_TIMEZONE", "America/Los_Angeles");
    const { getBudgetTimezone } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getBudgetTimezone()).toBe("America/Los_Angeles");
  });

  it("getCurrentDayKey/getCurrentMonthKey produce YYYY-MM-DD / YYYY-MM in the configured timezone", async () => {
    vi.stubEnv("AI_BUDGET_TIMEZONE", "America/New_York");
    const { getCurrentDayKey, getCurrentMonthKey } = await import("@/lib/growth-coach/ai/budget-config");
    // 2026-08-05T02:30:00Z is still 2026-08-04 (10:30pm) in America/New_York — a real UTC-offset boundary case, not just a UTC passthrough.
    const date = new Date("2026-08-05T02:30:00.000Z");
    expect(getCurrentDayKey(date)).toBe("2026-08-04");
    expect(getCurrentMonthKey(date)).toBe("2026-08");
  });

  it("month rolls over correctly across a month boundary in the configured timezone", async () => {
    vi.stubEnv("AI_BUDGET_TIMEZONE", "America/New_York");
    const { getCurrentDayKey, getCurrentMonthKey } = await import("@/lib/growth-coach/ai/budget-config");
    // 2026-09-01T03:00:00Z is 2026-08-31 (11pm) in America/New_York — still the OLD month locally.
    const date = new Date("2026-09-01T03:00:00.000Z");
    expect(getCurrentDayKey(date)).toBe("2026-08-31");
    expect(getCurrentMonthKey(date)).toBe("2026-08");
  });
});

describe("budget-config — daily tier limits", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to guest=8, free=30, client=50", async () => {
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "");
    vi.stubEnv("GROWTH_COACH_FREE_DAILY_LIMIT", "");
    vi.stubEnv("GROWTH_COACH_CLIENT_DAILY_LIMIT", "");
    const { getDailyLimit } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getDailyLimit("guest")).toBe(8);
    expect(getDailyLimit("free")).toBe(30);
    expect(getDailyLimit("client")).toBe(50);
  });

  it("honors per-tier env overrides", async () => {
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "3");
    vi.stubEnv("GROWTH_COACH_FREE_DAILY_LIMIT", "15");
    vi.stubEnv("GROWTH_COACH_CLIENT_DAILY_LIMIT", "100");
    const { getDailyLimit } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getDailyLimit("guest")).toBe(3);
    expect(getDailyLimit("free")).toBe(15);
    expect(getDailyLimit("client")).toBe(100);
  });

  it("falls back to the default for a non-numeric or non-positive override", async () => {
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "not-a-number");
    const { getDailyLimit: fresh1 } = await import("@/lib/growth-coach/ai/budget-config");
    expect(fresh1("guest")).toBe(8);

    vi.resetModules();
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "0");
    const { getDailyLimit: fresh2 } = await import("@/lib/growth-coach/ai/budget-config");
    expect(fresh2("guest")).toBe(8);
  });
});

describe("budget-config — monthly budget ceilings (split free/client pools)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to $100 for both pools", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "");
    vi.stubEnv("AI_MONTHLY_CLIENT_BUDGET_USD", "");
    const { getMonthlyBudgetUsd } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getMonthlyBudgetUsd("free")).toBe(100);
    expect(getMonthlyBudgetUsd("client")).toBe(100);
  });

  it("the two pools are independently configurable", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "50");
    vi.stubEnv("AI_MONTHLY_CLIENT_BUDGET_USD", "250");
    const { getMonthlyBudgetUsd } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getMonthlyBudgetUsd("free")).toBe(50);
    expect(getMonthlyBudgetUsd("client")).toBe(250);
  });

  it("labels the pools for alert emails", async () => {
    const { getPoolLabel } = await import("@/lib/growth-coach/ai/budget-config");
    expect(getPoolLabel("free")).toBe("Guest + Free-account");
    expect(getPoolLabel("client")).toBe("Client");
  });
});
