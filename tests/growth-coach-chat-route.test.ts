import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * REGRESSION: found live (via manual curl against the dev server, not by
 * inspection) — the route originally checked isAnthropicConfigured()
 * BEFORE validating the request body, so a malformed request (empty
 * messages array, or a history that doesn't end with a user turn) was
 * silently swallowed as the graceful "not_configured" response instead of
 * a real 400. Validation must always run first: a client bug is a client
 * bug regardless of whether the AI happens to be configured.
 *
 * This is the one route in the test suite tested directly rather than
 * through its underlying lib function — the bug was specifically about
 * the ORDER of two checks inside the route handler itself, which no
 * amount of unit-testing callGrowthCoachAi() in isolation would catch.
 * Stage 3 extends this file with the same rationale: the ORDER of the
 * circuit-breaker checks (and whether usage gets recorded) is a route-level
 * concern, not something a unit test of circuit-breaker.ts alone can catch.
 */

let anthropicConfigured = false;
vi.mock("@/lib/growth-coach/ai/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/growth-coach/ai/config")>();
  return { ...actual, isAnthropicConfigured: () => anthropicConfigured };
});

const mockCallGrowthCoachAi = vi.fn();
vi.mock("@/lib/growth-coach/ai/anthropic-client", () => ({
  callGrowthCoachAi: (...args: unknown[]) => mockCallGrowthCoachAi(...args),
}));

const mockResolveRequestTier = vi.fn();
vi.mock("@/lib/growth-coach/ai/tier", () => ({
  resolveRequestTier: (...args: unknown[]) => mockResolveRequestTier(...args),
}));

const mockIsMonthlyBudgetExhausted = vi.fn();
const mockCheckAndConsumeDailyTierLimit = vi.fn();
const mockRecordUsageAndMaybeAlert = vi.fn();
vi.mock("@/lib/growth-coach/ai/circuit-breaker", () => ({
  isMonthlyBudgetExhausted: (...args: unknown[]) => mockIsMonthlyBudgetExhausted(...args),
  checkAndConsumeDailyTierLimit: (...args: unknown[]) => mockCheckAndConsumeDailyTierLimit(...args),
  recordUsageAndMaybeAlert: (...args: unknown[]) => mockRecordUsageAndMaybeAlert(...args),
}));

function post(body: unknown) {
  return new NextRequest("http://localhost/api/growth-coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  anthropicConfigured = false;
  mockCallGrowthCoachAi.mockReset();
  mockResolveRequestTier.mockReset().mockResolvedValue({ tier: "guest", pool: "free", identityKey: "guest-hash", userId: null, identityHash: "guest-hash" });
  mockIsMonthlyBudgetExhausted.mockReset().mockResolvedValue(false);
  mockCheckAndConsumeDailyTierLimit.mockReset().mockResolvedValue({ allowed: true, count: 1, limit: 8 });
  mockRecordUsageAndMaybeAlert.mockReset().mockResolvedValue(undefined);
});

describe("POST /api/growth-coach/chat — validation runs before the configuration check", () => {
  it("returns a real 400 invalid_request for an empty messages array, not not_configured", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [] }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toEqual({ ok: false, reason: "invalid_request" });
  });

  it("returns a real 400 invalid_request when the last message isn't from the user, not not_configured", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "assistant", content: "hi" }] }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toEqual({ ok: false, reason: "invalid_request" });
  });

  it("returns a real 400 invalid_request for a missing messages field", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({}));
    expect(response.status).toBe(400);
  });

  it("only reaches the graceful not_configured response for an otherwise well-formed request", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "user", content: "How do I get more leads?" }] }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: false, reason: "not_configured" });
    // Unconfigured means the circuit breaker never even needs to be consulted.
    expect(mockResolveRequestTier).not.toHaveBeenCalled();
  });
});

describe("POST /api/growth-coach/chat — circuit breaker ordering and wiring (Stage 3)", () => {
  it("returns budget_exhausted and never calls the AI or consumes a daily-limit slot when the resolved pool's monthly budget is exhausted", async () => {
    anthropicConfigured = true;
    mockIsMonthlyBudgetExhausted.mockResolvedValue(true);
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "user", content: "hi" }] }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: false, reason: "budget_exhausted" });
    expect(mockCheckAndConsumeDailyTierLimit).not.toHaveBeenCalled();
    expect(mockCallGrowthCoachAi).not.toHaveBeenCalled();
  });

  it("checks the monthly budget BEFORE the daily tier limit — an exhausted pool shouldn't pay for a daily-limit increment on its way to being rejected anyway", async () => {
    anthropicConfigured = true;
    const order: string[] = [];
    mockIsMonthlyBudgetExhausted.mockImplementation(async () => {
      order.push("budget");
      return false;
    });
    mockCheckAndConsumeDailyTierLimit.mockImplementation(async () => {
      order.push("daily");
      return { allowed: true, count: 1, limit: 8 };
    });
    mockCallGrowthCoachAi.mockResolvedValue({ ok: true, content: "hi there", model: "m", inputTokens: 1, outputTokens: 1, estimatedCostUsd: 0 });
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    await POST(post({ messages: [{ role: "user", content: "hi" }] }));
    expect(order).toEqual(["budget", "daily"]);
  });

  it("returns daily_limit_reached and never calls the AI once the tier's daily cap is hit", async () => {
    anthropicConfigured = true;
    mockCheckAndConsumeDailyTierLimit.mockResolvedValue({ allowed: false, count: 9, limit: 8 });
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "user", content: "hi" }] }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: false, reason: "daily_limit_reached" });
    expect(mockCallGrowthCoachAi).not.toHaveBeenCalled();
  });

  it("on a successful AI call, records usage with the resolved tier/pool/identity and the real token counts/cost from the AI result", async () => {
    anthropicConfigured = true;
    mockResolveRequestTier.mockResolvedValue({ tier: "client", pool: "client", identityKey: "user-1", userId: "user-1", identityHash: null });
    mockCallGrowthCoachAi.mockResolvedValue({
      ok: true,
      content: "Here's some practical advice.",
      model: "claude-haiku-4-5-20251001",
      inputTokens: 400,
      outputTokens: 120,
      estimatedCostUsd: 0.0009,
    });
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "user", content: "How do I grow?" }] }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockRecordUsageAndMaybeAlert).toHaveBeenCalledWith({
      tier: "client",
      pool: "client",
      userId: "user-1",
      identityHash: null,
      model: "claude-haiku-4-5-20251001",
      inputTokens: 400,
      outputTokens: 120,
      estimatedCostUsd: 0.0009,
    });
  });

  it("does not record usage when the AI call itself fails — nothing was actually spent", async () => {
    anthropicConfigured = true;
    mockCallGrowthCoachAi.mockResolvedValue({ ok: false, reason: "api_error" });
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    await POST(post({ messages: [{ role: "user", content: "hi" }] }));
    expect(mockRecordUsageAndMaybeAlert).not.toHaveBeenCalled();
  });
});
