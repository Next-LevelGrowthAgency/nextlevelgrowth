import { afterEach, describe, expect, it, vi } from "vitest";

const mockAdapter = {
  incrementDailyTierUsage: vi.fn(),
  getMonthlyBudgetState: vi.fn(),
  incrementMonthlyBudgetUsage: vi.fn(),
  claimBudgetAlert: vi.fn(),
  recordUsageEvent: vi.fn(),
};
const mockSendTransactional = vi.fn();
const mockRecordEmailEvent = vi.fn();
const mockIsEmailDeliveryActive = vi.fn();

vi.mock("@/lib/growth-coach/adapters", () => ({
  getAiUsageAdapter: () => mockAdapter,
  getEmailAdapter: () => ({ sendTransactional: mockSendTransactional }),
  getLeadAdapter: () => ({ recordEmailEvent: mockRecordEmailEvent }),
  isEmailDeliveryActive: () => mockIsEmailDeliveryActive(),
}));

const usageInput = {
  tier: "guest" as const,
  pool: "free" as const,
  userId: null,
  identityHash: "hash-abc",
  model: "claude-haiku-4-5-20251001",
  inputTokens: 500,
  outputTokens: 100,
  estimatedCostUsd: 0.0011,
};

function resetMocks() {
  // resetAllMocks (not clearAllMocks) — must also clear mock
  // IMPLEMENTATIONS (e.g. mockRejectedValue from one test), not just call
  // history, or a rejection configured in one test silently leaks into
  // the next test's assertions.
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
}

describe("checkAndConsumeDailyTierLimit", () => {
  afterEach(resetMocks);

  it("allows when the atomically-incremented count is within the tier's daily limit", async () => {
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "8");
    mockAdapter.incrementDailyTierUsage.mockResolvedValue(5);
    const { checkAndConsumeDailyTierLimit } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect(await checkAndConsumeDailyTierLimit("guest", "id-1")).toEqual({ allowed: true, count: 5, limit: 8 });
  });

  it("denies once the incremented count exceeds the limit", async () => {
    vi.stubEnv("GROWTH_COACH_GUEST_DAILY_LIMIT", "8");
    mockAdapter.incrementDailyTierUsage.mockResolvedValue(9);
    const { checkAndConsumeDailyTierLimit } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect(await checkAndConsumeDailyTierLimit("guest", "id-1")).toEqual({ allowed: false, count: 9, limit: 8 });
  });

  it("allows exactly at the limit (count === limit is not over)", async () => {
    vi.stubEnv("GROWTH_COACH_FREE_DAILY_LIMIT", "30");
    mockAdapter.incrementDailyTierUsage.mockResolvedValue(30);
    const { checkAndConsumeDailyTierLimit } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect((await checkAndConsumeDailyTierLimit("free", "id-1")).allowed).toBe(true);
  });
});

describe("isMonthlyBudgetExhausted", () => {
  afterEach(resetMocks);

  it("is false when cumulative cost is below the pool's budget", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.getMonthlyBudgetState.mockResolvedValue({ cumulativeCostUsd: 5, alert80Sent: false, alert100Sent: false });
    const { isMonthlyBudgetExhausted } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect(await isMonthlyBudgetExhausted("free")).toBe(false);
  });

  it("is true once cumulative cost reaches the pool's budget", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.getMonthlyBudgetState.mockResolvedValue({ cumulativeCostUsd: 10, alert80Sent: false, alert100Sent: false });
    const { isMonthlyBudgetExhausted } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect(await isMonthlyBudgetExhausted("free")).toBe(true);
  });

  it("checks the 'client' pool independently of 'free'", async () => {
    vi.stubEnv("AI_MONTHLY_CLIENT_BUDGET_USD", "10");
    mockAdapter.getMonthlyBudgetState.mockImplementation(async (pool: string) => (pool === "client" ? { cumulativeCostUsd: 10, alert80Sent: false, alert100Sent: false } : { cumulativeCostUsd: 0, alert80Sent: false, alert100Sent: false }));
    const { isMonthlyBudgetExhausted } = await import("@/lib/growth-coach/ai/circuit-breaker");
    expect(await isMonthlyBudgetExhausted("client")).toBe(true);
    expect(await isMonthlyBudgetExhausted("free")).toBe(false);
  });
});

describe("recordUsageAndMaybeAlert", () => {
  afterEach(resetMocks);

  it("records the usage event and rolls the real cost into the monthly total, without alerting when well under 80%", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "100");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(1); // 1% of $100
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await recordUsageAndMaybeAlert(usageInput);

    expect(mockAdapter.recordUsageEvent).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "guest", pool: "free", identityHash: "hash-abc", estimatedCostUsd: 0.0011 })
    );
    expect(mockAdapter.incrementMonthlyBudgetUsage).toHaveBeenCalledWith("free", expect.any(String), 0.0011);
    expect(mockAdapter.claimBudgetAlert).not.toHaveBeenCalled();
  });

  it("sends exactly one 80% alert email when the new total crosses 80%, labeled with the correct pool", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(8); // exactly 80% of $10
    mockAdapter.claimBudgetAlert.mockResolvedValue(true);
    mockIsEmailDeliveryActive.mockReturnValue(true);
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-1" });
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await recordUsageAndMaybeAlert(usageInput);

    expect(mockAdapter.claimBudgetAlert).toHaveBeenCalledWith("free", expect.any(String), "80");
    expect(mockAdapter.claimBudgetAlert).not.toHaveBeenCalledWith("free", expect.any(String), "100");
    expect(mockSendTransactional).toHaveBeenCalledTimes(1);
    const sentEmail = mockSendTransactional.mock.calls[0][0];
    expect(sentEmail.subject).toMatch(/80%/);
    expect(sentEmail.subject.toLowerCase()).toContain("guest");
    expect(mockRecordEmailEvent).toHaveBeenCalledWith(expect.objectContaining({ leadId: null, emailType: "ai_budget_alert", status: "sent" }));
  });

  it("sends BOTH the 80% and 100% alerts when a single increment jumps past both thresholds at once", async () => {
    vi.stubEnv("AI_MONTHLY_CLIENT_BUDGET_USD", "10");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(11); // past 100% of $10 in one jump
    mockAdapter.claimBudgetAlert.mockResolvedValue(true);
    mockIsEmailDeliveryActive.mockReturnValue(true);
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-2" });
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await recordUsageAndMaybeAlert({ ...usageInput, tier: "client", pool: "client", userId: "user-1", identityHash: null });

    expect(mockAdapter.claimBudgetAlert).toHaveBeenCalledWith("client", expect.any(String), "80");
    expect(mockAdapter.claimBudgetAlert).toHaveBeenCalledWith("client", expect.any(String), "100");
    expect(mockSendTransactional).toHaveBeenCalledTimes(2);
  });

  it("does not send an email when claimBudgetAlert reports another request already claimed it", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(9);
    mockAdapter.claimBudgetAlert.mockResolvedValue(false);
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await recordUsageAndMaybeAlert(usageInput);

    expect(mockSendTransactional).not.toHaveBeenCalled();
  });

  it("still claims the alert (so it's marked sent for the month) but does not attempt to send when email delivery isn't configured", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(9);
    mockAdapter.claimBudgetAlert.mockResolvedValue(true);
    mockIsEmailDeliveryActive.mockReturnValue(false);
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await recordUsageAndMaybeAlert(usageInput);

    expect(mockAdapter.claimBudgetAlert).toHaveBeenCalled();
    expect(mockSendTransactional).not.toHaveBeenCalled();
  });

  it("never throws even when the adapter rejects — a tracking failure must not break the AI reply already shown to the visitor", async () => {
    mockAdapter.recordUsageEvent.mockRejectedValue(new Error("db unreachable"));
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");
    await expect(recordUsageAndMaybeAlert(usageInput)).resolves.toBeUndefined();
  });

  it("records a 'failed' email event (not thrown) when the send itself rejects", async () => {
    vi.stubEnv("AI_MONTHLY_FREE_BUDGET_USD", "10");
    mockAdapter.incrementMonthlyBudgetUsage.mockResolvedValue(9);
    mockAdapter.claimBudgetAlert.mockResolvedValue(true);
    mockIsEmailDeliveryActive.mockReturnValue(true);
    mockSendTransactional.mockRejectedValue(new Error("resend down"));
    const { recordUsageAndMaybeAlert } = await import("@/lib/growth-coach/ai/circuit-breaker");

    await expect(recordUsageAndMaybeAlert(usageInput)).resolves.toBeUndefined();
    expect(mockRecordEmailEvent).toHaveBeenCalledWith(expect.objectContaining({ emailType: "ai_budget_alert", status: "failed" }));
  });
});
