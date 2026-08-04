-- Next Level Growth Coach — AI usage tracking, per-tier daily limits, and
-- the split monthly cost circuit breaker
-- =============================================================================
-- Run AFTER 0001, 0002, and 0003. Backs the real-AI Growth Coach integration
-- (src/lib/growth-coach/ai/) added in Stage 2 with durable usage tracking:
--   - ai_usage_events: append-only audit log, one row per successful AI call
--     (real token counts + estimated cost — see PRICING_USD_PER_MILLION_TOKENS
--     in src/lib/growth-coach/ai/config.ts for the pricing assumption behind
--     estimated_cost_usd).
--   - ai_daily_tier_usage: a message counter per (tier, identity, day), used
--     to enforce the per-visitor daily caps (guest/free/client — see
--     src/lib/growth-coach/ai/budget-config.ts). "identity_key" is a Supabase
--     auth user id for signed-in visitors, or a salted hash of their IP for
--     anonymous guests (never a raw IP — see hashGuestIdentity() in
--     src/lib/growth-coach/ai/tier.ts).
--   - ai_monthly_budget_usage: the global cost circuit breaker, split into
--     two independent pools ('free' = guest + free-account usage combined,
--     'client' = paying-client usage). One row per (pool, month_key) —
--     month_key is a "YYYY-MM" string computed in a configured timezone
--     (AI_BUDGET_TIMEZONE), so a new calendar month naturally starts a new
--     row at zero — no scheduled reset job needed, the breaker just stops
--     matching any row once the month rolls over.
--
-- All three tables are written only through the RPC functions below (or by
-- the service-role key directly), from
-- src/lib/growth-coach/adapters/ai-usage-supabase.ts — never from the
-- browser. The increment functions are SECURITY DEFINER + atomic
-- (INSERT ... ON CONFLICT DO UPDATE ... RETURNING) specifically so
-- concurrent requests can never lose an increment to a race condition.
-- =============================================================================

-- ── Usage audit log ──────────────────────────────────────────────────────
create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tier text not null check (tier in ('guest', 'free', 'client')),
  pool text not null check (pool in ('free', 'client')),
  user_id uuid references auth.users (id) on delete set null,
  identity_hash text,
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  estimated_cost_usd numeric(12, 6) not null
);
create index if not exists ai_usage_events_created_at_idx on ai_usage_events (created_at desc);
create index if not exists ai_usage_events_pool_idx on ai_usage_events (pool);

alter table ai_usage_events enable row level security;
create policy "service role manages usage events" on ai_usage_events
  for all to service_role using (true) with check (true);
create policy "owner and admin can read usage events" on ai_usage_events
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

-- ── Per-visitor daily tier usage counter ─────────────────────────────────
create table if not exists ai_daily_tier_usage (
  tier text not null check (tier in ('guest', 'free', 'client')),
  identity_key text not null,
  day_key text not null,
  message_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (tier, identity_key, day_key)
);

alter table ai_daily_tier_usage enable row level security;
create policy "service role manages daily tier usage" on ai_daily_tier_usage
  for all to service_role using (true) with check (true);
create policy "owner and admin can read daily tier usage" on ai_daily_tier_usage
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

-- ── Monthly cost circuit breaker (split free/client pools) ──────────────
create table if not exists ai_monthly_budget_usage (
  pool text not null check (pool in ('free', 'client')),
  month_key text not null,
  cumulative_cost_usd numeric(12, 6) not null default 0,
  alert_80_sent boolean not null default false,
  alert_100_sent boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (pool, month_key)
);

alter table ai_monthly_budget_usage enable row level security;
create policy "service role manages monthly budget usage" on ai_monthly_budget_usage
  for all to service_role using (true) with check (true);
create policy "owner and admin can read monthly budget usage" on ai_monthly_budget_usage
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

-- ── Atomic increment/claim functions ─────────────────────────────────────

create or replace function increment_ai_daily_tier_usage(p_tier text, p_identity_key text, p_day_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into ai_daily_tier_usage (tier, identity_key, day_key, message_count)
  values (p_tier, p_identity_key, p_day_key, 1)
  on conflict (tier, identity_key, day_key)
  do update set message_count = ai_daily_tier_usage.message_count + 1, updated_at = now()
  returning message_count into v_count;
  return v_count;
end;
$$;

create or replace function increment_ai_monthly_budget_usage(p_pool text, p_month_key text, p_cost_delta numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric;
begin
  insert into ai_monthly_budget_usage (pool, month_key, cumulative_cost_usd)
  values (p_pool, p_month_key, p_cost_delta)
  on conflict (pool, month_key)
  do update set cumulative_cost_usd = ai_monthly_budget_usage.cumulative_cost_usd + excluded.cumulative_cost_usd, updated_at = now()
  returning cumulative_cost_usd into v_total;
  return v_total;
end;
$$;

-- Atomically flips the alert flag and returns whether THIS call is the one
-- that flipped it (false if another concurrent call already claimed it) —
-- guarantees the 80%/100% alert email is sent at most once per pool per
-- month, even under concurrent requests crossing the threshold together.
create or replace function claim_ai_budget_alert(p_pool text, p_month_key text, p_threshold text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed boolean := false;
begin
  if p_threshold = '80' then
    update ai_monthly_budget_usage set alert_80_sent = true, updated_at = now()
    where pool = p_pool and month_key = p_month_key and alert_80_sent = false;
    v_claimed := found;
  elsif p_threshold = '100' then
    update ai_monthly_budget_usage set alert_100_sent = true, updated_at = now()
    where pool = p_pool and month_key = p_month_key and alert_100_sent = false;
    v_claimed := found;
  end if;
  return v_claimed;
end;
$$;

-- ── New email_type for budget alert emails ──────────────────────────────
alter table growth_coach_email_events drop constraint if exists growth_coach_email_events_email_type_check;
alter table growth_coach_email_events add constraint growth_coach_email_events_email_type_check
  check (email_type in ('internal_notification', 'visitor_confirmation', 'account_welcome', 'password_reset', 'ai_budget_alert', 'other'));
