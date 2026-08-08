-- Next Level Growth — client-access request/approval flow (Stage 5)
-- =============================================================================
-- Run AFTER 0001-0006. Adds a simple, non-billing "request to become a
-- client" flow on top of the existing profiles.role column: a signed-in
-- 'prospect' can request client access from their portal; an owner/admin
-- approves or denies from /admin/users. This replaces the "run SQL by
-- hand" instruction that used to be the only way to change a role, for
-- this one specific, narrow transition — arbitrary role editing from the
-- app is still deliberately unsupported (see 0003's revoke on `role`).
--
-- Both directions (submitting a request, approving/denying one) are
-- implemented as server-only actions using the service-role client, never
-- the visitor's own RLS-scoped client — so the three admin-controlled
-- columns below are revoked from `authenticated` entirely, the same
-- defense-in-depth already applied to `role` itself in 0003. There is no
-- legitimate reason a browser-side Supabase client should ever write
-- role_request_status/role_reviewed_at/role_reviewed_by directly.
-- =============================================================================

alter table profiles
  add column if not exists role_request_status text not null default 'none' check (role_request_status in ('none', 'pending', 'approved', 'denied')),
  add column if not exists role_requested_at timestamptz,
  add column if not exists role_request_note text,
  add column if not exists role_reviewed_at timestamptz,
  add column if not exists role_reviewed_by uuid references auth.users (id) on delete set null;

revoke update (role_request_status, role_reviewed_at, role_reviewed_by) on profiles from authenticated;
