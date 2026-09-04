import { getAnalyticsEventAdapter } from "@/lib/growth-coach/adapters";
import { isAllowedEventName, isKnownPagePath } from "@/lib/site-analytics";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fire-and-forget analytics beacon for events a Server Component can't
 * observe directly — statically prerendered page views, and the contact
 * form's start/submit moments. Allowlists both the event name and (when
 * present) the page path against known values — this table feeds a
 * dashboard the owner reads directly, so it's worth rejecting anything
 * outside the known set rather than letting it fill with arbitrary
 * client-supplied strings. Never reads or persists anything beyond that —
 * no props, no PII.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body?.event === "string" ? body.event : null;
    const pagePath = typeof body?.pagePath === "string" ? body.pagePath : null;

    if (event && isAllowedEventName(event)) {
      await getAnalyticsEventAdapter().recordEvent({
        eventName: event,
        pagePath: pagePath && isKnownPagePath(pagePath) ? pagePath : null,
      });
    }
  } catch {
    // ignore malformed beacons
  }
  return NextResponse.json({ ok: true });
}
