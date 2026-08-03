/**
 * Ties every consent capture (report delivery, contact permissions,
 * marketing) to the exact disclosure text version shown at submission
 * time — stored on the lead as `consentLanguageVersion`. Bump this string
 * whenever the disclosure copy shown alongside a consent checkbox
 * (GrowthCoachLeadForm.tsx, the Growth Audit/Contact privacy notice)
 * materially changes, so a later dispute can reconstruct exactly what the
 * visitor agreed to.
 */
export const CONSENT_LANGUAGE_VERSION = "2026-08-03";
