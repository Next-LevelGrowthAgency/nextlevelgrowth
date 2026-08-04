/**
 * Client-safe fetch wrapper for POST /api/growth-coach/chat — no secrets,
 * no SDK import, safe to bundle into the browser. Every failure mode
 * (network error, non-200, malformed JSON, or the route's own typed
 * `ok: false`) normalizes to the same `{ ok: false }` shape so the caller
 * (GrowthCoach.tsx) has exactly one branch to handle before falling back
 * to the scripted engine.
 */

export type AiChatRequestMessage = { role: "user" | "assistant"; content: string };

export type AiChatApiResult =
  | { ok: true; content: string; usage: { inputTokens: number; outputTokens: number; estimatedCostUsd: number } }
  | { ok: false; reason: string };

export async function requestGrowthCoachAiReply(messages: AiChatRequestMessage[]): Promise<AiChatApiResult> {
  try {
    const res = await fetch("/api/growth-coach/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = (await res.json().catch(() => null)) as AiChatApiResult | null;
    if (!data) return { ok: false, reason: "network_error" };
    return data;
  } catch {
    return { ok: false, reason: "network_error" };
  }
}
