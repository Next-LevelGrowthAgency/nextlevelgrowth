import type { AiUsagePool, AiUsageTier } from "@/lib/growth-coach/adapters/types";

/**
 * Configuration for the Growth Coach's per-visitor daily tier limits and
 * the split monthly cost circuit breaker. Server-only (imported only by
 * ./tier.ts and ./circuit-breaker.ts, neither of which is client-safe).
 * Every limit here is env-overridable with a documented default — no
 * business-decision number is hard-coded without also being changeable
 * without a code change.
 */

/**
 * IANA timezone used to compute "today" (daily limits) and "this calendar
 * month" (monthly budget) — matters because the day/month boundary is a
 * real UTC-offset-dependent instant. Defaults to US Eastern as a
 * reasonable baseline for a US-based local-business agency; override with
 * AI_BUDGET_TIMEZONE for a different business timezone.
 */
export function getBudgetTimezone(): string {
  return process.env.AI_BUDGET_TIMEZONE?.trim() || "America/New_York";
}

function formatDayKey(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD, exactly the sortable key format wanted here.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** "YYYY-MM-DD" for the given instant (default: now) in the configured budget timezone. */
export function getCurrentDayKey(date: Date = new Date()): string {
  return formatDayKey(date, getBudgetTimezone());
}

/** "YYYY-MM" for the given instant (default: now) in the configured budget timezone — a fresh month_key naturally starts the monthly budget back at zero, no scheduled reset needed. */
export function getCurrentMonthKey(date: Date = new Date()): string {
  return formatDayKey(date, getBudgetTimezone()).slice(0, 7);
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveFloat(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseFloat(value) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Default daily message caps, per tier — deliberately conservative for guests since they carry no identity/accountability beyond an IP. */
export const DEFAULT_DAILY_LIMITS: Record<AiUsageTier, number> = {
  guest: 8,
  free: 30,
  client: 50,
};

export function getDailyLimit(tier: AiUsageTier): number {
  switch (tier) {
    case "guest":
      return parsePositiveInt(process.env.GROWTH_COACH_GUEST_DAILY_LIMIT, DEFAULT_DAILY_LIMITS.guest);
    case "free":
      return parsePositiveInt(process.env.GROWTH_COACH_FREE_DAILY_LIMIT, DEFAULT_DAILY_LIMITS.free);
    case "client":
      return parsePositiveInt(process.env.GROWTH_COACH_CLIENT_DAILY_LIMIT, DEFAULT_DAILY_LIMITS.client);
  }
}

/** Default monthly cost ceiling per budget pool, in USD. */
export const DEFAULT_MONTHLY_BUDGET_USD: Record<AiUsagePool, number> = {
  free: 100,
  client: 100,
};

export function getMonthlyBudgetUsd(pool: AiUsagePool): number {
  return pool === "free"
    ? parsePositiveFloat(process.env.AI_MONTHLY_FREE_BUDGET_USD, DEFAULT_MONTHLY_BUDGET_USD.free)
    : parsePositiveFloat(process.env.AI_MONTHLY_CLIENT_BUDGET_USD, DEFAULT_MONTHLY_BUDGET_USD.client);
}

/** Human-readable pool label for alert emails/logs. */
export function getPoolLabel(pool: AiUsagePool): string {
  return pool === "free" ? "Guest + Free-account" : "Client";
}
