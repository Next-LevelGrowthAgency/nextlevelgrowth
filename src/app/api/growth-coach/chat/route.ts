import { callGrowthCoachAi } from "@/lib/growth-coach/ai/anthropic-client";
import { isAnthropicConfigured } from "@/lib/growth-coach/ai/config";
import { MAX_HISTORY_MESSAGES, MAX_USER_MESSAGE_LENGTH } from "@/lib/growth-coach/ai/shared-config";
import { isRateLimited } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

/**
 * THE ONE route that calls a real AI model for the Growth Coach — replaces
 * the old, never-actually-called /api/chat scaffold (deleted in this
 * stage) so there's exactly one AI-calling code path, not two.
 *
 * Only ever hit for genuinely open-ended free-text turns — see
 * isOpenConversationTurn() in engine.ts, checked client-side before this
 * route is called at all, so structured flows/assessments never pay for
 * an API call they don't need. On ANY failure here (not configured,
 * rate-limited, timeout, API error), the client falls back to the
 * existing scripted engine — this route never leaves a visitor stuck.
 *
 * Stage 3 hook: this route doesn't persist usage yet. Once Stage 3's
 * ai_usage_events/ai_daily_budget tables and the global cost circuit
 * breaker exist, this is where a) the breaker gets checked BEFORE calling
 * the model, and b) the real token counts already returned here get
 * written to those tables. The token/cost numbers are already extracted
 * and returned in this response specifically so that stage doesn't need
 * to touch anything in this file except adding those two things.
 */

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_USER_MESSAGE_LENGTH),
});

const chatRequestSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1)
    .max(MAX_HISTORY_MESSAGES * 2), // client already trims, this is a hard server-side ceiling regardless of what the client sends
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited("growth-coach-ai-chat", ip, 60_000, 20)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  // Validate BEFORE checking configuration — a malformed request is a
  // client bug regardless of whether the AI is set up, and should always
  // get a real 400 rather than being silently swallowed as
  // "not_configured" (verified live: this order matters, the reverse
  // order masked bad-request bugs behind the graceful-fallback path).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_request" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid_request" }, { status: 400 });
  }

  const messages = parsed.data.messages.slice(-MAX_HISTORY_MESSAGES);
  if (messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ ok: false, reason: "invalid_request" }, { status: 400 });
  }

  if (!isAnthropicConfigured()) {
    // Not an error — this is the normal "AI not configured yet" state,
    // same shape as any other failure so the client's fallback path is a
    // single code path regardless of *why* the AI didn't answer.
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });
  }

  const result = await callGrowthCoachAi(messages);

  if (!result.ok) {
    if (result.reason === "api_error" || result.reason === "empty_response") {
      console.error(`[growth-coach-ai-chat] AI call failed (${result.reason}):`, result.detail ?? "");
    }
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    content: result.content,
    model: result.model,
    usage: {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostUsd: result.estimatedCostUsd,
    },
  });
}
