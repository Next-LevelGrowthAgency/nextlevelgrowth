/**
 * Server-side, in-memory (globalThis-backed, dev-only) counters powering
 * the dashboard's analytics overview. Populated by POSTs to
 * /api/growth-coach/analytics — never anything richer than an event name
 * and a count; no PII, no per-visitor tracking, no timestamps tied to an
 * identifiable person.
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
