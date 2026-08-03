import { z } from "zod";

/**
 * ONE authoritative set of field validators, shared by every form schema
 * (contact, growth-audit, growth-coach lead, and any future auth/portal
 * schema) so email/name/phone rules can never drift out of sync between
 * forms again.
 *
 * ROOT CAUSE this module fixes: `z.string().email()` used directly (no
 * `.trim()`) rejects any email with leading/trailing whitespace — trivially
 * common from mobile keyboard autocomplete and autofill — with the same
 * generic "invalid email" message as an actually-malformed address. Every
 * email field in this codebase must go through `emailField` below, never
 * a bare `z.string().email()`.
 */

// ---------------------------------------------------------------------
// Email — trim + lowercase BEFORE validating format. Verified empirically
// (not assumed) that Zod applies `.trim()`/`.toLowerCase()` before `.email()`
// when chained in this order, so " Test@Gmail.com " -> "test@gmail.com".
// ---------------------------------------------------------------------
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address.")
  .max(200, "That email address is too long.")
  .email("Please enter a valid email address.");

export const optionalEmailField = z
  .string()
  .trim()
  .toLowerCase()
  .max(200, "That email address is too long.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || z.string().email().safeParse(v).success, { message: "Please enter a valid email address." });

// ---------------------------------------------------------------------
// Name — allow spaces, apostrophes, hyphens, periods, and accented
// characters (José, O'Brien, Anne-Marie, Al Jr.) without being so loose
// that it accepts garbage. Trimmed so trailing-space names don't fail a
// min-length check on an effectively-empty value.
// ---------------------------------------------------------------------
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

export function nameField(label = "name", opts: { min?: number; max?: number } = {}) {
  return z
    .string()
    .trim()
    .min(opts.min ?? 1, `Please enter your ${label}.`)
    .max(opts.max ?? 200, `That ${label} is too long.`)
    .refine((v) => NAME_PATTERN.test(v), { message: `Please enter a valid ${label} (letters, spaces, apostrophes, and hyphens only).` });
}

// ---------------------------------------------------------------------
// Phone — loosely accepts common formatting ((555) 123-4567, +1 555 123
// 4567, 555.123.4567) and validates by counting actual digits rather than
// raw string length, so formatting characters never cause a false
// rejection.
// ---------------------------------------------------------------------
const PHONE_MIN_DIGITS = 7;
function hasEnoughDigits(value: string): boolean {
  return value.replace(/\D/g, "").length >= PHONE_MIN_DIGITS;
}

export const phoneField = z
  .string()
  .trim()
  .min(1, "Please enter a phone number.")
  .refine(hasEnoughDigits, { message: "Please enter a valid phone number." });

export const optionalPhoneField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || hasEnoughDigits(v), { message: "Please enter a valid phone number." });

// ---------------------------------------------------------------------
// Generic optional text — blank/whitespace-only normalizes to `undefined`
// so "" and "not provided" are always treated identically downstream
// (storage, email templates, conditional logic).
// ---------------------------------------------------------------------
export function optionalTrimmedString(max = 2000) {
  return z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));
}

/** Messages: trimmed, but internal line breaks are preserved (only leading/trailing whitespace is stripped). */
export function messageField(opts: { min?: number; max?: number } = {}) {
  return z
    .string()
    .trim()
    .min(opts.min ?? 1, "Please share a bit more detail in your message.")
    .max(opts.max ?? 5000, "That message is a bit long — please shorten it.");
}

export const optionalUrlField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^https?:\/\/.+\..+/i.test(v), { message: "Enter a valid URL (starting with http:// or https://)" });

/**
 * Honeypot: real visitors never see or fill this field. Not constrained to
 * length 0 in the schema itself so a filled value still reaches the route
 * handler, which rejects it with an explicit "spam rejected" outcome
 * instead of a generic validation error.
 */
export const honeypotField = z.string().max(300).optional().or(z.literal(""));

// `.nullable()` matters here, not just `.optional()`: the client-side ref
// backing this value (see ContactForm.tsx/GrowthAuditForm.tsx/
// GrowthCoachLeadForm.tsx) starts as `useRef<string | null>(null)` and
// stays `null` for as long as Turnstile is unconfigured (TurnstileWidget
// renders nothing and never calls its onToken callback). JSON.stringify
// preserves that `null` in the request body, and a bare `z.string()
// .optional()` only accepts `string | undefined` — it rejects `null`
// with "Expected string, received null", failing every real submission
// while Turnstile is off. `.nullable().optional()` accepts undefined,
// null, or a real token string.
export const turnstileTokenField = z.string().nullable().optional();

export const consentBooleanField = z.boolean().default(false);
