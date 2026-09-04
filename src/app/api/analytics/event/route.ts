import { incrementAnalyticsCounter } from "@/lib/growth-coach/analytics-store";
import { isClientEventName } from "@/lib/site-analytics";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fire-and-forget analytics beacon for the small set of client-side
 * conversion events that can't be observed from a Server Component (the
 * contact form's start/submit moments). Unlike the older
 * /api/growth-coach/analytics beacon, this one allowlists event names —
 * this store now feeds a dashboard the owner reads directly, so it's
 * worth rejecting anything outside the known set rather than letting the
 * counters list fill with arbitrary client-supplied strings. Never reads
 * or persists anything beyond the event name — no props, no PII.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body?.event === "string" ? body.event : null;
    if (event && isClientEventName(event)) incrementAnalyticsCounter(event);
  } catch {
    // ignore malformed beacons
  }
  return NextResponse.json({ ok: true });
}
