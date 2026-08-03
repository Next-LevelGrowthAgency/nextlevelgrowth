import { getEmailAdapter, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { verifyTurnstileToken } from "@/lib/growth-coach/spam-protection";
import { growthAuditSchema } from "@/lib/growth-audit-schema";
import { siteConfig } from "@/lib/site-config";
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
  const data = parsed.data;

  // Honeypot: a real visitor never fills this field.
  if (data.companyWebsite2) {
    return NextResponse.json({ error: "Submission rejected." }, { status: 400 });
  }

  const turnstile = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json({ error: "Spam check failed. Please reload and try again." }, { status: 400 });
  }

  try {
    await getEmailAdapter().sendTransactional({
      to: process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email,
      subject: `New Growth Audit request from ${data.businessName}`,
      body: [
        `Name: ${data.name}`,
        `Business: ${data.businessName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `Website: ${data.websiteUrl || "(none)"}`,
        `Industry: ${data.industry}`,
        `Location: ${data.location}`,
        `Primary goal: ${data.primaryGoal}`,
        `Biggest challenge: ${data.biggestChallenge}`,
        `Services of interest: ${data.servicesOfInterest.join(", ")}`,
        `Preferred contact: ${data.preferredContact}`,
        data.additionalDetails ? `Additional details: ${data.additionalDetails}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (error) {
    console.error("[growth-audit] Notification email failed:", error instanceof Error ? error.message : error);
  }

  if (!isEmailDeliveryActive()) {
    console.warn("[growth-audit] RESEND_API_KEY/EMAIL_FROM_ADDRESS not set — submission validated but logged to console only. See .env.example.");
  }

  return NextResponse.json({ ok: true });
}
