/**
 * Constants that are safe to bundle into the browser — no secrets, no SDK
 * import. Both the client (GrowthCoach.tsx, client-request.ts) and the
 * server (config.ts, the API route) import from here, so the two sides
 * can never disagree about limits like history length. Anything that
 * touches ANTHROPIC_API_KEY or does real API calls belongs in config.ts /
 * anthropic-client.ts instead, never here.
 */

/** How many of the most recent messages to send as conversation history — a simple cap, not the fuller context-summarization strategy planned for Stage 3. */
export const MAX_HISTORY_MESSAGES = 12;

/** Hard ceiling on a single visitor turn sent to the model — mirrors the existing MAX_INPUT constraints used elsewhere in this codebase (e.g. the old /api/chat scaffold capped at 2000). */
export const MAX_USER_MESSAGE_LENGTH = 2000;
