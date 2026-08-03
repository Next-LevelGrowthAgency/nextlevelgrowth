import { getEmailAdapter, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { verifyTurnstileToken } from "@/lib/growth-coach/spam-protection";
import { siteConfig } from "@/lib/site-config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  // Honeypot — real visitors never see or fill this field.
  companyWebsite2: z.string().max(300).optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

// Extremely small in-memory rate limit (per server instance). For real
// production traffic on Vercel, replace with a durable store such as
// Upstash Redis — serverless instances don't share memory across requests.
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

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your name, email, and message." }, { status: 400 });
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
      subject: `New contact form message from ${data.name}`,
      body: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    });
  } catch (error) {
    console.error("[contact] Notification email failed:", error instanceof Error ? error.message : error);
  }

  if (!isEmailDeliveryActive()) {
    console.warn("[contact] RESEND_API_KEY/EMAIL_FROM_ADDRESS not set — submission validated but logged to console only. See .env.example.");
  }

  return NextResponse.json({ ok: true });
}
