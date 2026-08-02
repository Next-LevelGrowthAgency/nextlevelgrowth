import type { AnalyticsEvent } from "@/types";

/**
 * Privacy-conscious analytics abstraction, called from client components.
 * No third-party analytics provider is connected — events are logged to
 * the console in development, and separately beaconed to
 * /api/growth-coach/analytics, which increments a server-side, in-memory
 * counter (see analytics-store.ts) that powers the dashboard overview.
 * The server endpoint only ever records the event *name*; props passed
 * here are for local console visibility only and are never sent over the
 * network. Swap this for a real provider call in Phase B, keeping the
 * same rule: event name + coarse, non-identifying props only. Never pass
 * message text, email, phone, name, or exact revenue here.
 */
export function track(event: AnalyticsEvent, props: Record<string, string | number | boolean> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, props);
  }
  if (typeof window !== "undefined") {
    fetch("/api/growth-coach/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never break the coaching experience.
    });
  }
}
