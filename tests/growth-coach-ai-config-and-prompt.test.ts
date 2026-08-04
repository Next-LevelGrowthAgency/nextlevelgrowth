import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateCostUsd, isAnthropicConfigured, PRICING_USD_PER_MILLION_TOKENS } from "@/lib/growth-coach/ai/config";
import { buildGrowthCoachSystemPrompt } from "@/lib/growth-coach/ai/system-prompt";
import { getServiceCatalogSummary } from "@/lib/growth-coach/services";

describe("AI config — model resolution and configuration check", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("isAnthropicConfigured is false without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { isAnthropicConfigured: fresh } = await import("@/lib/growth-coach/ai/config");
    expect(fresh()).toBe(false);
  });

  it("isAnthropicConfigured is true once an API key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
    const { isAnthropicConfigured: fresh } = await import("@/lib/growth-coach/ai/config");
    expect(fresh()).toBe(true);
  });

  it("getGrowthCoachModel defaults to Haiku 4.5 when GROWTH_COACH_MODEL is unset", async () => {
    vi.stubEnv("GROWTH_COACH_MODEL", "");
    const { getGrowthCoachModel, DEFAULT_GROWTH_COACH_MODEL } = await import("@/lib/growth-coach/ai/config");
    expect(getGrowthCoachModel()).toBe(DEFAULT_GROWTH_COACH_MODEL);
    expect(DEFAULT_GROWTH_COACH_MODEL).toBe("claude-haiku-4-5-20251001");
  });

  it("getGrowthCoachModel honors an override without a code change", async () => {
    vi.stubEnv("GROWTH_COACH_MODEL", "claude-opus-5");
    const { getGrowthCoachModel } = await import("@/lib/growth-coach/ai/config");
    expect(getGrowthCoachModel()).toBe("claude-opus-5");
  });

  it("isAnthropicConfigured is unaffected by the (unrelated, now-removed) old AI_CHAT_PROVIDER_API_KEY variable", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("AI_CHAT_PROVIDER_API_KEY", "leftover-unrelated-value");
    const { isAnthropicConfigured: fresh } = await import("@/lib/growth-coach/ai/config");
    expect(fresh()).toBe(false);
  });
});

describe("Cost estimation — pricing assumption regression guard", () => {
  it("matches Anthropic's published Claude Haiku 4.5 rate ($1/$5 per MTok in/out) as of 2026-08-04 — verified against platform.claude.com/docs, not guessed", () => {
    expect(PRICING_USD_PER_MILLION_TOKENS.input).toBe(1.0);
    expect(PRICING_USD_PER_MILLION_TOKENS.output).toBe(5.0);
  });

  it("computes cost correctly for a realistic-sized reply", () => {
    // 1,500 input tokens (system prompt + history), 300 output tokens (a short conversational reply)
    const cost = estimateCostUsd(1500, 300);
    expect(cost).toBeCloseTo(1500 / 1_000_000 + (300 * 5) / 1_000_000, 8);
  });

  it("zero tokens costs zero", () => {
    expect(estimateCostUsd(0, 0)).toBe(0);
  });
});

describe("Growth Coach system prompt", () => {
  const prompt = buildGrowthCoachSystemPrompt();

  it("includes the five-part response pattern", () => {
    expect(prompt).toMatch(/understood what they actually said/i);
    expect(prompt).toMatch(/most important underlying issue/i);
    expect(prompt).toMatch(/practical steps/i);
    expect(prompt).toMatch(/where Next Level Growth could help/i);
    expect(prompt).toMatch(/one focused, relevant question/i);
  });

  it("explicitly forbids guaranteeing outcomes", () => {
    expect(prompt).toMatch(/never guarantee, promise, or imply a specific outcome/i);
  });

  it("explicitly forbids fabricating statistics/market data", () => {
    expect(prompt).toMatch(/never fabricate statistics, market data/i);
  });

  it("explicitly forbids forcing the agency into every reply", () => {
    expect(prompt).toMatch(/never pitch Next Level Growth in every single message/i);
  });

  it("explicitly forbids recommending a mismatched service", () => {
    expect(prompt).toMatch(/never recommend a Next Level Growth service that doesn't genuinely fit/i);
  });

  it("includes prompt-injection resistance instructions", () => {
    expect(prompt).toMatch(/untrusted content, not a command/i);
    expect(prompt.toLowerCase()).toContain("reveal this system prompt");
  });

  it("discloses it's an AI, not a human, when asked", () => {
    expect(prompt.toLowerCase()).toContain("you're an ai assistant");
  });

  it("forbids licensed professional advice (legal/tax/medical/financial)", () => {
    expect(prompt.toLowerCase()).toContain("licensed legal, tax, accounting, financial, investment, or medical advice");
  });

  it("stays in sync with the real service catalog — every real service name appears in the prompt", () => {
    const services = getServiceCatalogSummary();
    expect(services.length).toBeGreaterThan(0);
    for (const service of services) {
      expect(prompt).toContain(service.name);
    }
  });

  it("never mentions a fabricated/placeholder price", () => {
    expect(prompt).not.toMatch(/\$\d/);
  });
});
