import { createHash } from "node:crypto";

/**
 * SHA-256 hex digest — the one place this codebase turns a raw identifier
 * (an IP address, so far) into a stable, non-plaintext pseudonym before it
 * gets stored or used as a lookup key. Not a substitute for real
 * anonymization/salting where that's specifically required — sufficient
 * for its current uses (Growth Coach AI daily-usage-tier bucketing in
 * src/lib/growth-coach/ai/tier.ts, and the consent-audit IP record in the
 * lead-capture routes) since both exist to correlate repeat requests from
 * the same source, not to cryptographically protect the IP.
 */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
