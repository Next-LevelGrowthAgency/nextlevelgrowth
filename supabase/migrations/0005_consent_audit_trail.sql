-- Next Level Growth Coach — strengthened consent audit trail
-- =============================================================================
-- Run AFTER 0001-0004. Adds three columns to growth_coach_leads so a
-- consent capture carries more than just a timestamp and a copy version if
-- it's ever disputed:
--   - consent_ip_hash: SHA-256 hash of the submitting IP (never the raw
--     IP — see sha256Hex in src/lib/hash.ts), captured at submission time.
--   - consent_user_agent: the raw User-Agent header at submission time.
--   - consent_terms_version: which Terms of Service document version
--     (TERMS_OF_SERVICE_VERSION, src/lib/consent.ts) was live at that
--     moment — distinct from the existing consent_language_version, which
--     tracks the checkbox copy, not the full terms document.
-- No RLS changes needed — these are additive columns on an existing table
-- whose policies (0001/0003) already govern the whole row.
-- =============================================================================

alter table growth_coach_leads
  add column if not exists consent_ip_hash text,
  add column if not exists consent_user_agent text,
  add column if not exists consent_terms_version text;
