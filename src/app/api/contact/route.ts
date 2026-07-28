import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
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

  // ── Delivery step (not yet configured) ────────────────────────────
  // Wire this up to your email provider or CRM once EMAIL_PROVIDER_API_KEY
  // (see .env.example) is set. Never hard-code API keys in this file —
  // always read from process.env so secrets stay out of source control.
  //
  // Example:
  // await sendEmail({
  //   to: process.env.EMAIL_TO_ADDRESS,
  //   subject: `New contact form message from ${parsed.data.name}`,
  //   body: parsed.data.message,
  // });

  if (!process.env.EMAIL_PROVIDER_API_KEY) {
    console.warn(
      "[contact] EMAIL_PROVIDER_API_KEY is not set — submission was validated but not delivered anywhere. See .env.example."
    );
  }

  return NextResponse.json({ ok: true });
}
