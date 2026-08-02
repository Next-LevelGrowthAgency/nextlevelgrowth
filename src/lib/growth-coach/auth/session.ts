import type { AdminRole, AdminSessionPayload } from "@/types";

/**
 * DEV-GRADE SESSION SIGNING — built entirely on the Web Crypto API
 * (`crypto.subtle`, `btoa`/`atob`) rather than Node's `node:crypto`, so
 * this module works unmodified in both Node.js route handlers AND the
 * Edge middleware runtime that actually gates /admin/*. That's a real,
 * server-verified session — not client-side route hiding — but it is
 * still a single shared dev credential with no user table, no password
 * reset flow, and no MFA. See the production auth recommendation before
 * ever deploying this.
 */

export const SESSION_COOKIE_NAME = "ngc_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret(): string {
  const secret = process.env.GROWTH_COACH_SESSION_SECRET;
  if (!secret) {
    throw new Error("GROWTH_COACH_SESSION_SECRET is not set. Set it in .env.local — see .env.example.");
  }
  return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(role: AdminRole): Promise<string> {
  const payload: AdminSessionPayload = { role, issuedAt: Date.now(), expiresAt: Date.now() + SESSION_DURATION_MS };
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  try {
    const key = await importKey(getSecret());
    const payloadBytes = base64UrlDecode(payloadPart);
    const signatureBytes = base64UrlDecode(signaturePart);
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes as BufferSource, payloadBytes as BufferSource);
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as AdminSessionPayload;
    if (typeof payload.expiresAt !== "number" || payload.expiresAt < Date.now()) return null;
    if (payload.role !== "owner" && payload.role !== "admin" && payload.role !== "staff") return null;
    return payload;
  } catch {
    return null;
  }
}
