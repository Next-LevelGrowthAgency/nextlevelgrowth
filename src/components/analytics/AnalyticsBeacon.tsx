"use client";

import type { SiteEventName, SitePagePath } from "@/lib/site-analytics";
import { useEffect, useRef } from "react";

/**
 * Fires one first-party analytics beacon on mount. Exists for pages that
 * are statically prerendered (see site-analytics.ts) — a client
 * component embedded in a static Server Component page doesn't force the
 * page dynamic, so this is how those pages still get a real per-visit
 * count instead of one build-time count. The useRef guard means it fires
 * exactly once per real mount, including under React Strict Mode's
 * double-invoke in development.
 */
export function AnalyticsBeacon({ event, pagePath }: { event: SiteEventName; pagePath?: SitePagePath }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, pagePath }),
      keepalive: true,
    }).catch(() => {});
  }, [event, pagePath]);

  return null;
}
