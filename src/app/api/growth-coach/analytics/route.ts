import { incrementAnalyticsCounter } from "@/lib/growth-coach/analytics-store";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Fire-and-forget analytics beacon. Deliberately does not read or persist
 * anything beyond the event name — no props, no IP-derived identity, no
 * PII — even if a caller ever sent more. Never fails loudly: analytics
 * must never break the coaching experience.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = typeof body?.event === "string" ? body.event : null;
    if (event) incrementAnalyticsCounter(event);
  } catch {
    // ignore malformed beacons
  }
  return NextResponse.json({ ok: true });
}
