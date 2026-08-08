/**
 * Ties every consent capture (report delivery, contact permissions,
 * marketing) to the exact disclosure text version shown at submission
 * time — stored on the lead as `consentLanguageVersion`. Bump this string
 * whenever the disclosure copy shown alongside a consent checkbox
 * (GrowthCoachLeadForm.tsx, the Growth Audit/Contact privacy notice)
 * materially changes, so a later dispute can reconstruct exactly what the
 * visitor agreed to.
 */
export const CONSENT_LANGUAGE_VERSION = "2026-08-04";

/**
 * Separate from CONSENT_LANGUAGE_VERSION above — that one tracks the
 * disclosure text shown alongside a consent CHECKBOX; this one tracks
 * which version of the actual Terms of Service DOCUMENT (src/app/terms/
 * page.tsx) was live at the moment of submission, stored on the lead as
 * `consentTermsVersion` for the consent audit trail. Bump this string
 * whenever terms/page.tsx's content changes, and update the version
 * shown on that page to match — they must always agree, since the stored
 * value is only meaningful as a pointer back to what that page said at
 * the time.
 */
export const TERMS_OF_SERVICE_VERSION = "2026-08-08";
