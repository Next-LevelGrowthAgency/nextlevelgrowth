import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  // Short rolling history sent from the client, kept out of any database —
  // this route is intentionally stateless.
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional(),
});

const submissionLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(key: string) {
  const now = Date.now();
  const timestamps = (submissionLog.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  submissionLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

const NON_AI_FALLBACK =
  "Thanks for reaching out — our virtual assistant isn't available right now, but you can request a Free Growth Audit or send us a message on the Contact page and a real person will follow up.";

/**
 * Server-side proxy for the AI chat widget. Deliberately does NOT call an
 * AI provider yet — that only happens once AI_CHAT_PROVIDER_API_KEY is set
 * (see .env.example). Until then, every request gets the non-AI fallback,
 * so the widget can ship disabled/safe and be turned on later without a
 * code change.
 *
 * When you do wire up a provider:
 * - Keep the API key server-side only (never expose it to the client).
 * - Enforce the system prompt rules below: disclose it's a virtual
 *   assistant, never promise guaranteed results, and escalate to a human
 *   for anything outside approved FAQ content.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { reply: "You're sending messages a little quickly — please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  if (!process.env.AI_CHAT_PROVIDER_API_KEY) {
    return NextResponse.json({ reply: NON_AI_FALLBACK, isFallback: true });
  }

  try {
    // PLACEHOLDER — integrate your chosen AI provider here (Anthropic,
    // OpenAI, etc.), using a system prompt that enforces:
    //   1. Always disclose it is a virtual assistant, not a person.
    //   2. Only answer using approved FAQ / service information.
    //   3. Never make guarantees about results, pricing, or timelines.
    //   4. Offer to collect name/email/phone and escalate to a human for
    //      anything it can't confidently answer.
    //
    // const reply = await callAiProvider(parsed.data.message, parsed.data.history);
    // return NextResponse.json({ reply });

    return NextResponse.json({ reply: NON_AI_FALLBACK, isFallback: true });
  } catch {
    return NextResponse.json({ reply: NON_AI_FALLBACK, isFallback: true });
  }
}
