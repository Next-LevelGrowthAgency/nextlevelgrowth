-- Next Level Growth Coach — durable lead storage
-- =============================================================================
-- Run this in the Supabase SQL Editor (or `supabase db push`) on a new
-- Supabase Postgres project. Matches the shape src/lib/growth-coach/adapters/
-- supabase.ts reads and writes — if you rename a column here, update that
-- file's row<->LeadProfile mapping functions too.
--
-- Deliberately ONE denormalized table (plus two small append-only logs)
-- rather than the fully normalized ~15-table star schema sketched in
-- src/lib/growth-coach/production-schema.ts. That file remains the
-- reference design for a later analytics-focused migration (e.g. "most
-- common weakness this quarter" as a fast indexed query); this migration
-- optimizes for "ship a real, durable adapter behind the existing
-- LeadAdapter interface without changing anything above it."
--
-- RLS design: the Next.js route handlers that write here always use the
-- Supabase SERVICE ROLE key server-side (bypasses RLS by design — see
-- SUPABASE_SERVICE_ROLE_KEY in .env.example). The policies below are a
-- defense-in-depth backstop for if the anon/authenticated keys are ever
-- used directly (e.g. a future client-side Supabase Auth integration for
-- the owner dashboard), not something the current app depends on.
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists growth_coach_leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  source text not null default 'growth-coach',
  campaign_source text,

  first_name text,
  last_name text,
  email text,
  phone text,
  preferred_contact_method text check (preferred_contact_method in ('Email', 'Phone', 'Text')),

  business_name text,
  industry text,
  city text,
  state text,
  service_area text,
  website_url text,
  years_in_business text,
  business_stage text,
  team_size text,
  primary_goal text,
  primary_challenge text,
  marketing_channels text,
  monthly_lead_volume text,
  lead_response_process text,
  website_status text,
  google_business_profile_status text,
  review_process text,
  revenue_range text,
  marketing_budget_range text,
  weekly_time_available integer,
  desired_timeline text,
  personal_constraints text,

  service_interests jsonb,
  recommended_services jsonb,
  recommended_plan jsonb,

  conversation_summary text,
  current_state text,
  ideal_state text,
  growth_gap text,
  quick_wins jsonb,
  thirty_day_plan jsonb,
  ninety_day_roadmap jsonb,
  next_action text,

  lead_qualification_level text,
  consultation_requested boolean not null default false,
  ninety_day_plan_requested boolean not null default false,

  growth_score integer,
  growth_score_confidence text,
  growth_score_band text,
  biggest_growth_gap text,
  growth_category_snapshot jsonb,

  consent_to_save_report boolean not null default false,
  consent_to_email_follow_up boolean not null default false,
  consent_to_phone_call boolean not null default false,
  consent_to_text_message boolean not null default false,
  consent_to_marketing boolean not null default false,
  report_consent_timestamp timestamptz,
  contact_consent_timestamp timestamptz,
  marketing_consent_timestamp timestamptz,

  follow_up_status text not null default 'new',
  assigned_owner uuid,
  internal_notes text,

  -- Set once email delivery is attempted — surfaces in the owner dashboard
  -- rather than only in server logs (spec: EmailDelivery tracking).
  internal_email_status text,
  visitor_email_status text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists growth_coach_leads_email_idx on growth_coach_leads (email);
create index if not exists growth_coach_leads_created_at_idx on growth_coach_leads (created_at desc);
create index if not exists growth_coach_leads_follow_up_status_idx on growth_coach_leads (follow_up_status);

alter table growth_coach_leads enable row level security;

-- Anon key may INSERT only (defense-in-depth; the app never actually uses
-- the anon key for this table today — see comment above).
create policy "anon insert only" on growth_coach_leads
  for insert
  to anon
  with check (true);

-- Authenticated users get read/write ONLY if their JWT's app_metadata.role
-- is 'owner' or 'admin' — 'staff' gets no lead-row access at all, matching
-- src/lib/growth-coach/auth/guard.ts's isAuthorizedForLeadData().
create policy "owner and admin can read leads" on growth_coach_leads
  for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('owner', 'admin'));

create policy "owner and admin can update leads" on growth_coach_leads
  for update
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('owner', 'admin'))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('owner', 'admin'));

-- No DELETE policy for anyone, including authenticated owner/admin — lead
-- deletion must go through the application's requestDeletion() workflow
-- (still uses the service-role key), never a direct table grant.

-- ── Append-only analytics counters (event name + timestamp only, no PII) ──
create table if not exists growth_coach_analytics_events (
  id bigint generated always as identity primary key,
  event text not null,
  created_at timestamptz not null default now()
);
alter table growth_coach_analytics_events enable row level security;
create policy "service role manages analytics" on growth_coach_analytics_events
  for all
  to service_role
  using (true)
  with check (true);

-- ── Append-only admin audit log ──
create table if not exists growth_coach_audit_events (
  id bigint generated always as identity primary key,
  action text not null,
  actor_role text not null,
  lead_id uuid references growth_coach_leads (id) on delete set null,
  detail text,
  created_at timestamptz not null default now()
);
alter table growth_coach_audit_events enable row level security;
create policy "owner can read audit log" on growth_coach_audit_events
  for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'owner');
create policy "service role writes audit log" on growth_coach_audit_events
  for insert
  to service_role
  with check (true);
