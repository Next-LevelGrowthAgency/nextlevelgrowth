import { growthAuditSchema } from "@/lib/growth-audit-schema";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Same lightweight, per-instance rate limiter used by /api/contact.
// Replace with a durable store (e.g. Upstash Redis) for real production
// traffic, since serverless functions don't share memory across invocations.
const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(key: string) {
  const now = Date.now();
  const timestamps = (submissionLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  submissionLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  // TODO before launch: verify a spam-protection token here (e.g. Cloudflare
  // Turnstile / hCaptcha) using TURNSTILE_SECRET_KEY from .env.example,
  // before trusting the payload below.

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = growthAuditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your form entries and try again.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // ── Delivery step (not yet configured) ────────────────────────────
  // This is where a submitted Growth Audit request should be sent to your
  // team and/or CRM. Two common options:
  //
  // 1. Email notification (e.g. Resend, Postmark, SendGrid):
  //    await sendEmail({
  //      to: process.env.EMAIL_TO_ADDRESS,
  //      subject: `New Growth Audit request from ${parsed.data.businessName}`,
  //      body: JSON.stringify(parsed.data, null, 2),
  //    });
  //
  // 2. CRM integration (e.g. HubSpot, Pipedrive, Airtable):
  //    await fetch(process.env.CRM_ENDPOINT_URL!, {
  //      method: "POST",
  //      headers: { Authorization: `Bearer ${process.env.CRM_API_KEY}` },
  //      body: JSON.stringify(parsed.data),
  //    });
  //
  // Never hard-code API keys here — always read from process.env so
  // secrets stay out of source control (see .env.example).

  if (!process.env.EMAIL_PROVIDER_API_KEY && !process.env.CRM_API_KEY) {
    console.warn(
      "[growth-audit] No EMAIL_PROVIDER_API_KEY or CRM_API_KEY set — submission was validated but not delivered anywhere. See .env.example."
    );
  }

  return NextResponse.json({ ok: true });
}
