import Anthropic from "@anthropic-ai/sdk";
import { estimateCostUsd, getGrowthCoachModel, isAnthropicConfigured, MAX_RESPONSE_TOKENS, REQUEST_TIMEOUT_MS } from "./config";
import { buildGrowthCoachSystemPrompt } from "./system-prompt";

/**
 * Thin, server-only wrapper around the Anthropic Messages API — the ONE
 * code path in this codebase that calls a real AI model for the Growth
 * Coach. Never imported by client components (ANTHROPIC_API_KEY must stay
 * server-side only). Lazy-initialized so an unconfigured environment
 * never throws at import time — matches the existing Resend/Supabase
 * adapter pattern in this codebase.
 */

export type AiChatMessage = { role: "user" | "assistant"; content: string };

export type AiCoachCallResult =
  | {
      ok: true;
      content: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd: number;
    }
  | {
      ok: false;
      reason: "not_configured" | "timeout" | "api_error" | "empty_response";
      /** Safe to log server-side; never shown to the visitor. */
      detail?: string;
    };

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set. See .env.example.");
  if (!client) client = new Anthropic({ apiKey });
  return client;
}

/**
 * Calls Claude for one Growth Coach conversational turn. Never throws —
 * every failure mode (unconfigured, timeout, API error, malformed
 * response) returns a typed `ok: false` result so the caller can fall
 * back to the existing scripted engine (src/lib/growth-coach/engine.ts)
 * without a try/catch at every call site.
 */
export async function callGrowthCoachAi(history: AiChatMessage[]): Promise<AiCoachCallResult> {
  if (!isAnthropicConfigured()) {
    return { ok: false, reason: "not_configured" };
  }

  const model = getGrowthCoachModel();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await getClient().messages.create(
      {
        model,
        max_tokens: MAX_RESPONSE_TOKENS,
        system: buildGrowthCoachSystemPrompt(),
        messages: history,
      },
      { signal: controller.signal }
    );

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text" || !textBlock.text.trim()) {
      return { ok: false, reason: "empty_response" };
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    return {
      ok: true,
      content: textBlock.text.trim(),
      model,
      inputTokens,
      outputTokens,
      estimatedCostUsd: estimateCostUsd(inputTokens, outputTokens),
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      reason: isAbort ? "timeout" : "api_error",
      detail: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}
