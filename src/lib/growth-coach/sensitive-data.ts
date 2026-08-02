/**
 * Defense-in-depth guard against a visitor accidentally (or maliciously)
 * pasting credentials or other highly sensitive data into a lead-capture
 * field. Used client-side (inline warning) and server-side (hard reject)
 * in the /api/growth-coach/lead route. Not a substitute for the standing
 * disclosure already shown in the coach's disclaimer — this just catches
 * the case where someone pastes it anyway.
 */

const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/;
const CARD_NUMBER_PATTERN = /\b(?:\d[ -]?){13,19}\b/;
const SENSITIVE_KEYWORDS = /\b(password|passwd|social security|ssn|routing number|account number|cvv|pin code)\b/i;

export function containsSensitiveData(text: string): boolean {
  if (!text) return false;
  return SSN_PATTERN.test(text) || CARD_NUMBER_PATTERN.test(text) || SENSITIVE_KEYWORDS.test(text);
}
