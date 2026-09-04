import { getAnalyticsEventAdapter } from "@/lib/growth-coach/adapters";
import type { AnalyticsWindowDays } from "@/lib/growth-coach/adapters/types";

/**
 * Site-wide first-party conversion events — durable in Supabase once
 * configured (analytics_events table, migration 0008), falling back to
 * the existing in-memory counter otherwise (see
 * analytics-events-local-mock.ts for the durability caveat).
 *
 * Most public pages (/, /pricing, /approach, /work, /about,
 * /growth-audit) are statically prerendered at BUILD time for
 * performance/SEO — a Server Component call in one of those only runs
 * once, at build, not per visitor. So page views and conversion clicks on
 * those pages go through <AnalyticsBeacon> (a tiny client component,
 * fires once on mount) instead of a direct server-side call. /contact is
 * the one exception: it already reads searchParams (for the ?package=
 * prefill), which makes it dynamic per-request already, so its view and
 * package-click are tracked directly, server-side, with no client JS.
 */
export const SITE_PAGE_PATHS = ["/", "/pricing", "/approach", "/work", "/about", "/contact"] as const;
export type SitePagePath = (typeof SITE_PAGE_PATHS)[number];

const PACKAGE_CLICK_EVENTS = ["foundation_click", "launch_click", "growth_click", "next_level_click"] as const;
type PackageClickEvent = (typeof PACKAGE_CLICK_EVENTS)[number];

const PACKAGE_SLUG_TO_EVENT: Record<string, PackageClickEvent> = {
  foundation: "foundation_click",
  launch: "launch_click",
  growth: "growth_click",
  "next-level": "next_level_click",
};

/** Every event name a beacon (client or the /contact server render) is allowed to record. */
export const ALLOWED_EVENT_NAMES = [
  "page_view",
  "pricing_view",
  "approach_view",
  "growth_audit_click",
  ...PACKAGE_CLICK_EVENTS,
  "contact_start",
  "contact_submit",
] as const;
export type SiteEventName = (typeof ALLOWED_EVENT_NAMES)[number];

export function isAllowedEventName(value: string): value is SiteEventName {
  return (ALLOWED_EVENT_NAMES as readonly string[]).includes(value);
}

export function isKnownPagePath(value: string): value is SitePagePath {
  return (SITE_PAGE_PATHS as readonly string[]).includes(value);
}

/** Server-side tracking — only valid on a route that's actually dynamic per-request (currently just /contact). */
export async function trackPageView(pagePath: SitePagePath) {
  await getAnalyticsEventAdapter().recordEvent({ eventName: "page_view", pagePath });
}

export async function trackPackageClick(packageSlug: string) {
  const event = PACKAGE_SLUG_TO_EVENT[packageSlug];
  if (!event) return;
  await getAnalyticsEventAdapter().recordEvent({ eventName: event, pagePath: "/pricing" });
}

const PACKAGE_EVENT_LABELS: Record<PackageClickEvent, string> = {
  foundation_click: "Foundation",
  launch_click: "Launch",
  growth_click: "Growth",
  next_level_click: "Next Level",
};

export async function getSiteAnalyticsSnapshot(windowDays: AnalyticsWindowDays = 30) {
  const snapshot = await getAnalyticsEventAdapter().getSnapshot(windowDays);

  const packageClicks = Object.fromEntries(
    PACKAGE_CLICK_EVENTS.map((event) => [PACKAGE_EVENT_LABELS[event], snapshot.eventCounts[event] ?? 0])
  );

  const topPage = Object.entries(snapshot.pageViewsByPath).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    ...snapshot,
    topPage,
    pricingViews: snapshot.eventCounts["pricing_view"] ?? 0,
    approachViews: snapshot.eventCounts["approach_view"] ?? 0,
    growthAuditClicks: snapshot.eventCounts["growth_audit_click"] ?? 0,
    contactStarts: snapshot.eventCounts["contact_start"] ?? 0,
    contactSubmits: snapshot.eventCounts["contact_submit"] ?? 0,
    packageClicks,
  };
}

export async function listRecentActivity(limit = 15) {
  return getAnalyticsEventAdapter().listRecent(limit);
}
