-- Next Level Growth — user profiles, roles, and role-based RLS
-- =============================================================================
-- Run AFTER 0001 and 0002. Adds real Supabase Auth support: a `profiles`
-- table (one row per auth.users row, auto-created on signup), a
-- `current_user_role()` helper function, and updates the earlier
-- migrations' RLS policies to check that function instead of a JWT
-- app_metadata claim (which would require a separate custom-claims/auth
-- hook setup) — role checks now come straight from the database, matching
-- "owner role must come from database role, not client-side email
-- matching."
-- =============================================================================

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  business_name text,
  phone text,
  -- 'prospect' is the default for a fresh signup with no other signal.
  -- There is deliberately no way for a client-side request to set this to
  -- 'owner'/'admin' — see the "first owner" instructions in the completion
  -- report for the one-time manual SQL step required instead.
  role text not null default 'prospect' check (role in ('owner', 'admin', 'team', 'client', 'prospect')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- A user may read and update their OWN profile row, but may not change
-- their own `role` — enforced by revoking column-level UPDATE on `role`
-- from the `authenticated` role entirely (owners/admins change roles via
-- the service-role key / SQL editor only, never through the app's own
-- anon-key-authenticated update path).
create policy "users can read their own profile" on profiles
  for select to authenticated
  using (id = auth.uid());

create policy "users can update their own profile" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update (role) on profiles from authenticated;

create or replace function current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create policy "owner and admin can read all profiles" on profiles
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

create policy "owner can update any profile" on profiles
  for update to authenticated
  using (current_user_role() = 'owner')
  with check (current_user_role() = 'owner');

create policy "service role manages profiles" on profiles
  for all to service_role using (true) with check (true);

-- Auto-create a profile row whenever a new auth.users row is created
-- (covers email/password signup, magic link, and any future OAuth
-- provider) so there's never a signed-in user with no profile/role.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ── Replace the earlier app_metadata-based policies with current_user_role() ──
drop policy if exists "owner and admin can read leads" on growth_coach_leads;
create policy "owner and admin can read leads" on growth_coach_leads
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

drop policy if exists "owner and admin can update leads" on growth_coach_leads;
create policy "owner and admin can update leads" on growth_coach_leads
  for update to authenticated
  using (current_user_role() in ('owner', 'admin'))
  with check (current_user_role() in ('owner', 'admin'));

-- New: a signed-in client may read their OWN leads (requests they
-- submitted while logged in — user_id is set at submission time when a
-- session exists; anonymous submissions have user_id null and are only
-- ever visible to owner/admin).
create policy "users can read their own leads" on growth_coach_leads
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "owner and admin can read email events" on growth_coach_email_events;
create policy "owner and admin can read email events" on growth_coach_email_events
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

drop policy if exists "owner and admin can read conversations" on growth_coach_conversations;
create policy "owner and admin can read conversations" on growth_coach_conversations
  for select to authenticated
  using (current_user_role() in ('owner', 'admin'));

drop policy if exists "users can read their own conversations" on growth_coach_conversations;
create policy "users can read their own conversations" on growth_coach_conversations
  for select to authenticated
  using (user_id = auth.uid());

-- ── Audit log for admin actions (role changes, lead status changes, etc.) ──
create table if not exists growth_coach_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_role text,
  action text not null,
  lead_id uuid references growth_coach_leads (id) on delete set null,
  detail text,
  created_at timestamptz not null default now()
);
alter table growth_coach_audit_log enable row level security;
create policy "service role manages audit log" on growth_coach_audit_log
  for all to service_role using (true) with check (true);
create policy "owner can read audit log" on growth_coach_audit_log
  for select to authenticated
  using (current_user_role() = 'owner');
