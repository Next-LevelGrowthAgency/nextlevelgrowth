import { getAnalyticsCounts, incrementAnalyticsCounter } from "@/lib/growth-coach/analytics-store";

/**
 * Site-wide first-party conversion events, tracked with the same
 * lightweight in-memory counter used by Growth Coach (see
 * analytics-store.ts for the durability caveat).
 *
 * Most public pages (/, /pricing, /approach, /work, /about,
 * /growth-audit) are statically prerendered at BUILD time for
 * performance/SEO — a Server Component call in one of those only runs
 * once, at build, not per visitor. So page views and the growth-audit
 * click go through <AnalyticsBeacon> (a tiny client component, fires
 * once on mount) instead of a direct server-side call. /contact is the
 * one exception: it already reads searchParams (for the ?package=
 * prefill), which makes it dynamic per-request already, so its view and
 * package-click are tracked directly, server-side, with no client JS.
 */
export const SITE_PAGE_VIEW_KEYS = ["home", "pricing", "approach", "work", "about", "contact"] as const;
export type SitePageViewKey = (typeof SITE_PAGE_VIEW_KEYS)[number];

const PAGE_VIEW_EVENT_NAMES = SITE_PAGE_VIEW_KEYS.map((key) => `page_view:${key}`);

/** Every event name a client beacon is allowed to increment. */
export const CLIENT_EVENT_NAMES = [...PAGE_VIEW_EVENT_NAMES, "growth_audit_click", "contact_start", "contact_submit"] as const;
export type ClientEventName = (typeof CLIENT_EVENT_NAMES)[number];

export function pageViewEventName(page: SitePageViewKey): ClientEventName {
  return `page_view:${page}` as ClientEventName;
}

/** Server-side tracking — only valid on a route that's actually dynamic per-request (currently just /contact). */
export function trackPageView(page: SitePageViewKey) {
  incrementAnalyticsCounter(pageViewEventName(page));
}

export function trackPackageClick(packageSlug: string) {
  incrementAnalyticsCounter("package_click");
  if (/^[a-z-]{1,32}$/.test(packageSlug)) {
    incrementAnalyticsCounter(`package_click:${packageSlug}`);
  }
}

export function isClientEventName(value: string): value is ClientEventName {
  return (CLIENT_EVENT_NAMES as readonly string[]).includes(value);
}

const PACKAGE_SLUGS = ["foundation", "launch", "growth", "next-level"] as const;

export function getSiteAnalyticsSnapshot() {
  const counts = getAnalyticsCounts();
  const pageViews = Object.fromEntries(SITE_PAGE_VIEW_KEYS.map((key) => [key, counts[pageViewEventName(key)] ?? 0])) as Record<SitePageViewKey, number>;
  const packageClicksBySlug = Object.fromEntries(PACKAGE_SLUGS.map((slug) => [slug, counts[`package_click:${slug}`] ?? 0])) as Record<(typeof PACKAGE_SLUGS)[number], number>;

  return {
    pageViews,
    growthAuditClicks: counts["growth_audit_click"] ?? 0,
    packageClicks: counts["package_click"] ?? 0,
    packageClicksBySlug,
    contactStarts: counts["contact_start"] ?? 0,
    contactSubmits: counts["contact_submit"] ?? 0,
  };
}
