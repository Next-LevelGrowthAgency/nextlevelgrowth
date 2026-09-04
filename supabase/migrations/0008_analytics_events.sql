-- Next Level Growth — durable first-party analytics events
-- =============================================================================
-- Run AFTER 0001-0007. Backs the admin dashboard's Overview/Traffic/Pages
-- views (src/lib/growth-coach/adapters/analytics-events-supabase.ts) once
-- Supabase is connected — until then the app falls back to the existing
-- in-memory counters (analytics-store.ts), same fail-safe pattern as the
-- lead/email adapters in 0001.
--
-- Deliberately minimal: no visitor/session identity, no IP storage, no
-- form contents. `metadata` is a small JSONB bag for the rare event that
-- needs one extra field (e.g. which pricing package was clicked) — never
-- a place to stash PII.
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  -- Reserved for a future privacy-safe, non-identifying per-visit token
  -- (e.g. a random value in a short-lived cookie) — not populated today.
  session_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table analytics_events enable row level security;

create index if not exists analytics_events_event_name_idx on analytics_events (event_name);
create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc);
create index if not exists analytics_events_page_path_idx on analytics_events (page_path);

-- Writes always go through the Next.js API route using the SERVICE ROLE
-- key (src/app/api/analytics/event/route.ts, which validates the event
-- name against an explicit allowlist before ever calling this table) —
-- there is deliberately no insert policy for anon/authenticated, so a
-- direct client-side Supabase call could never write here even if one
-- were attempted.
create policy "service role manages analytics events" on analytics_events
  for all to service_role using (true) with check (true);

-- Only the owner/admin dashboard reads this table; it is never queried
-- directly from the browser with the anon key.
create policy "owner and admin can read analytics events" on analytics_events
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));
