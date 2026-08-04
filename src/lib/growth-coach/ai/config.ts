/**
 * Configuration and cost math for the real-AI Growth Coach integration.
 * Server-only — never imported by a "use client" component (the Anthropic
 * API key must never reach the browser). Constants that ARE safe to share
 * with the client live in ./shared-config.ts instead.
 */

export { MAX_HISTORY_MESSAGES, MAX_USER_MESSAGE_LENGTH } from "./shared-config";

/** Default model: Claude Haiku 4.5 — cost-effective, fast, well-suited to a conversational lead-qualifying assistant. Override with GROWTH_COACH_MODEL without a code change. */
export const DEFAULT_GROWTH_COACH_MODEL = "claude-haiku-4-5-20251001";

export function getGrowthCoachModel(): string {
  return process.env.GROWTH_COACH_MODEL?.trim() || DEFAULT_GROWTH_COACH_MODEL;
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * PRICING ASSUMPTION — verified against Anthropic's official published
 * pricing at https://platform.claude.com/docs/en/about-claude/pricing on
 * 2026-08-04: Claude Haiku 4.5 is $1.00 / MTok input, $5.00 / MTok output
 * (standard, non-cached, non-batch rate). This is NOT fetched live and
 * WILL go stale if Anthropic changes pricing or if GROWTH_COACH_MODEL is
 * pointed at a different model — the cost this produces is an estimate
 * for budgeting purposes (Stage 3's circuit breaker), not a billing-grade
 * number. Update these two constants (and this comment's date) if the
 * model or its price changes.
 */
export const PRICING_USD_PER_MILLION_TOKENS = {
  input: 1.0,
  output: 5.0,
} as const;

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * PRICING_USD_PER_MILLION_TOKENS.input;
  const outputCost = (outputTokens / 1_000_000) * PRICING_USD_PER_MILLION_TOKENS.output;
  return inputCost + outputCost;
}

/** Conversational replies should be concise, not report-length — keeps both cost and reading time down. */
export const MAX_RESPONSE_TOKENS = 700;

/** Network timeout for a single Anthropic call. */
export const REQUEST_TIMEOUT_MS = 15_000;
