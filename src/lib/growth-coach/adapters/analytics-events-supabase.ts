import { getServiceRoleClient } from "./supabase-client";
import type { AnalyticsEventAdapter, AnalyticsSnapshot } from "./types";

/**
 * PRODUCTION DATABASE ADAPTER — active only once Supabase is configured
 * (see isSupabaseConfigured() in ./supabase-client and ./index.ts's
 * factory). Always uses the service-role client server-side; RLS on
 * analytics_events has no insert/select policy for anon/authenticated, so
 * this table is only ever reachable through this adapter.
 */

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD, UTC
}

export const supabaseAnalyticsEventAdapter: AnalyticsEventAdapter = {
  async recordEvent({ eventName, pagePath, metadata }) {
    try {
      const supabase = getServiceRoleClient();
      await supabase.from("analytics_events").insert({
        event_name: eventName,
        page_path: pagePath ?? null,
        metadata: metadata ?? null,
      });
    } catch (error) {
      // Never let an analytics write break the request that triggered it.
      console.error("[analytics] Failed to record event:", error instanceof Error ? error.message : error);
    }
  },

  async getSnapshot(windowDays): Promise<AnalyticsSnapshot> {
    const supabase = getServiceRoleClient();
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_name, page_path, created_at")
      .gte("created_at", since.toISOString())
      .limit(20_000);

    if (error || !data) {
      console.error("[analytics] getSnapshot query failed:", error?.message);
      return { totalPageViews: 0, pageViewsByPath: {}, eventCounts: {}, dailyPageViews: [], durable: true };
    }

    const pageViewsByPath: Record<string, number> = {};
    const eventCounts: Record<string, number> = {};
    const dailyCounts = new Map<string, number>();
    let totalPageViews = 0;

    for (const row of data as { event_name: string; page_path: string | null; created_at: string }[]) {
      if (row.event_name === "page_view") {
        totalPageViews += 1;
        if (row.page_path) pageViewsByPath[row.page_path] = (pageViewsByPath[row.page_path] ?? 0) + 1;
        const key = dayKey(new Date(row.created_at));
        dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
      } else {
        eventCounts[row.event_name] = (eventCounts[row.event_name] ?? 0) + 1;
      }
    }

    // Fill every day in the window, including zero-count days, oldest first — a real trend line, not just the days that happened to have data.
    const dailyPageViews: { date: string; count: number }[] = [];
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      dailyPageViews.push({ date: d, count: dailyCounts.get(d) ?? 0 });
    }

    return { totalPageViews, pageViewsByPath, eventCounts, dailyPageViews, durable: true };
  },

  async listRecent(limit = 20) {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("id, event_name, page_path, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as { id: string; event_name: string; page_path: string | null; created_at: string }[]).map((row) => ({
      id: row.id,
      eventName: row.event_name,
      pagePath: row.page_path,
      createdAt: new Date(row.created_at).getTime(),
    }));
  },
};
