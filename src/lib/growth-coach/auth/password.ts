import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Node-only (never imported by middleware/Edge code). Used exclusively by
 * the login route handler, which runs `export const runtime = "nodejs"`.
 */

export function hashDevPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyDevPassword(password: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
