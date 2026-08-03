import { z } from "zod";
import { optionalTrimmedString } from "@/lib/validation/fields";

/**
 * Shared, optional attribution fields spread into every submission schema
 * (contact, growth-audit, growth-coach lead) so "where did this lead come
 * from" is captured consistently. Client components populate these from
 * `window.location`/`document.referrer`/the page's UTM query params at
 * submit time — never required, never blocks a submission if absent.
 */
export const attributionSchemaFields = {
  sourcePage: optionalTrimmedString(500),
  referrer: optionalTrimmedString(500),
  utmSource: optionalTrimmedString(100),
  utmMedium: optionalTrimmedString(100),
  utmCampaign: optionalTrimmedString(100),
};

export type AttributionFields = z.infer<z.ZodObject<typeof attributionSchemaFields>>;

/** Reads the current page's attribution signals — call only in client components. */
export function collectAttribution(): AttributionFields {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    sourcePage: window.location.pathname,
    referrer: document.referrer || undefined,
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
  };
}
