/**
 * Server-side, in-memory (globalThis-backed) event counters powering the
 * admin dashboard's analytics — both the Growth Coach funnel (POSTs to
 * /api/growth-coach/analytics) and the site-wide conversion events
 * (POSTs to /api/analytics/event, plus direct server-side calls from page
 * components — see src/lib/site-analytics.ts). Never anything richer than
 * an event name and a count; no PII, no per-visitor tracking, no
 * timestamps tied to an identifiable person.
 *
 * These counts live in a single Node process's memory. On Vercel that
 * means they're best-effort, not durable: a cold start, redeploy, or a
 * request landing on a different serverless instance all reset or split
 * the count. Good enough for a lightweight "what's getting used" signal;
 * not a substitute for real analytics or durable storage. The admin UI
 * that reads these values says so explicitly rather than implying
 * precision it doesn't have.
 */
type AnalyticsStore = { counts: Record<string, number> };
const globalForAnalytics = globalThis as unknown as { __growthCoachAnalyticsStore?: AnalyticsStore };
const store: AnalyticsStore = globalForAnalytics.__growthCoachAnalyticsStore ?? { counts: {} };
globalForAnalytics.__growthCoachAnalyticsStore = store;

const MAX_EVENT_NAME_LENGTH = 64;

export function incrementAnalyticsCounter(event: string) {
  if (typeof event !== "string" || !event || event.length > MAX_EVENT_NAME_LENGTH) return;
  store.counts[event] = (store.counts[event] ?? 0) + 1;
}

export function getAnalyticsCounts(): Record<string, number> {
  return { ...store.counts };
}
