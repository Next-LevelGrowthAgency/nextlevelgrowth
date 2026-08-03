-- Next Level Growth Coach — lead extensions, email delivery log, and
-- Growth Coach transcript storage
-- =============================================================================
-- Run AFTER 0001_growth_coach_leads.sql. Adds the columns/tables needed for:
--   - Unifying Contact form and Growth Audit submissions into the same
--     `growth_coach_leads` table as Growth Coach leads (source column
--     distinguishes them), instead of those two forms never persisting
--     anywhere durable.
--   - UTM/referrer attribution.
--   - Associating a lead with a signed-in portal user (nullable — most
--     leads are anonymous).
--   - A real, queryable email-delivery log (Resend message IDs, per-send
--     status) instead of only server console logs.
--   - Growth Coach conversation transcripts.
-- =============================================================================

alter table growth_coach_leads
  add column if not exists message text,
  add column if not exists user_id uuid,
  add column if not exists submission_payload jsonb,
  add column if not exists source_page text,
  add column if not exists referrer text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists consent_language_version text;

create index if not exists growth_coach_leads_user_id_idx on growth_coach_leads (user_id);
create index if not exists growth_coach_leads_source_idx on growth_coach_leads (source);

-- ── Email delivery log ──────────────────────────────────────────────────
create table if not exists growth_coach_email_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references growth_coach_leads (id) on delete set null,
  email_type text not null check (email_type in ('internal_notification', 'visitor_confirmation', 'account_welcome', 'password_reset', 'other')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists growth_coach_email_events_lead_id_idx on growth_coach_email_events (lead_id);
alter table growth_coach_email_events enable row level security;
create policy "service role manages email events" on growth_coach_email_events
  for all to service_role using (true) with check (true);
create policy "owner and admin can read email events" on growth_coach_email_events
  for select to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('owner', 'admin'));

-- ── Growth Coach transcripts ─────────────────────────────────────────────
create table if not exists growth_coach_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid unique references growth_coach_leads (id) on delete cascade,
  user_id uuid,
  business_path text,
  response_depth text,
  summary text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists growth_coach_conversations_user_id_idx on growth_coach_conversations (user_id);
alter table growth_coach_conversations enable row level security;
create policy "service role manages conversations" on growth_coach_conversations
  for all to service_role using (true) with check (true);
create policy "owner and admin can read conversations" on growth_coach_conversations
  for select to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') in ('owner', 'admin'));
create policy "users can read their own conversations" on growth_coach_conversations
  for select to authenticated
  using (user_id = auth.uid());

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists growth_coach_conversations_set_updated_at on growth_coach_conversations;
create trigger growth_coach_conversations_set_updated_at
  before update on growth_coach_conversations
  for each row execute function set_updated_at();
