import { getAnalyticsCounts, incrementAnalyticsCounter } from "@/lib/growth-coach/analytics-store";
import type { AnalyticsEventAdapter, AnalyticsSnapshot } from "./types";

/**
 * Fallback used only when Supabase isn't configured. Wraps the existing
 * flat in-memory counter (analytics-store.ts) — it has no timestamps or
 * per-event records, so a real date window, daily trend, or recent-events
 * feed genuinely can't be computed from it. The adapter says so honestly
 * (snapshot.durable = false, dailyPageViews/listRecent empty) rather than
 * inventing a shape it can't back.
 */
function pageViewKey(pagePath: string) {
  return `page_view:${pagePath}`;
}

export const localAnalyticsEventAdapter: AnalyticsEventAdapter = {
  async recordEvent({ eventName, pagePath }) {
    if (eventName === "page_view" && pagePath) {
      incrementAnalyticsCounter(pageViewKey(pagePath));
    } else {
      incrementAnalyticsCounter(eventName);
    }
  },

  async getSnapshot(): Promise<AnalyticsSnapshot> {
    const counts = getAnalyticsCounts();
    const pageViewsByPath: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    let totalPageViews = 0;

    for (const [key, count] of Object.entries(counts)) {
      if (key.startsWith("page_view:")) {
        const path = key.slice("page_view:".length);
        pageViewsByPath[path] = count;
        totalPageViews += count;
      } else {
        eventCounts[key] = count;
      }
    }

    return { totalPageViews, pageViewsByPath, eventCounts, dailyPageViews: [], durable: false };
  },

  async listRecent() {
    return [];
  },
};
