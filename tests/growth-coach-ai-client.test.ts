import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The Anthropic API is fully mocked here (and in every other automated
 * test in this repo) — never a real call, per this sprint's explicit
 * safety rule against spending real money in CI. Manual verification with
 * a real, short, cheap call is a separate step documented in the Stage 2
 * report, not something an automated test does.
 */
const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
    constructor(_opts: unknown) {
      void _opts;
    }
  },
}));

describe("callGrowthCoachAi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    mockCreate.mockReset();
  });

  it("returns not_configured without ever calling the SDK when ANTHROPIC_API_KEY is unset", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hello" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_configured");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("extracts real input/output token counts and computes cost from a successful response", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Here's some practical advice for your business." }],
      usage: { input_tokens: 1000, output_tokens: 200 },
    });
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "How do I get more leads?" }]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.content).toBe("Here's some practical advice for your business.");
      expect(result.inputTokens).toBe(1000);
      expect(result.outputTokens).toBe(200);
      // 1000 input tok * $1/MTok + 200 output tok * $5/MTok = $0.001 + $0.001 = $0.002
      expect(result.estimatedCostUsd).toBeCloseTo(0.002, 6);
      expect(result.model).toBe("claude-haiku-4-5-20251001");
    }
  });

  it("respects GROWTH_COACH_MODEL when set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("GROWTH_COACH_MODEL", "claude-sonnet-5");
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "reply" }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model).toBe("claude-sonnet-5");
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: "claude-sonnet-5" }), expect.anything());
  });

  it("returns api_error (not a throw) when the SDK rejects", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockRejectedValueOnce(new Error("connection refused"));
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("api_error");
  });

  it("returns timeout when the request is aborted", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    mockCreate.mockRejectedValueOnce(abortError);
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("timeout");
  });

  it("returns empty_response when the model returns no text content block", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValueOnce({ content: [], usage: { input_tokens: 10, output_tokens: 0 } });
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("empty_response");
  });

  it("returns empty_response for a whitespace-only reply", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockResolvedValueOnce({ content: [{ type: "text", text: "   " }], usage: { input_tokens: 10, output_tokens: 1 } });
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    const result = await callGrowthCoachAi([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("empty_response");
  });

  it("never throws — a rejected promise from the SDK is always caught and normalized", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    mockCreate.mockRejectedValueOnce("a non-Error rejection value");
    const { callGrowthCoachAi } = await import("@/lib/growth-coach/ai/anthropic-client");
    await expect(callGrowthCoachAi([{ role: "user", content: "hi" }])).resolves.toMatchObject({ ok: false });
  });
});
