/**
 * Whether real Supabase Auth (signup/login/portal/admin-by-role) can be
 * used at all. Distinct from isSupabaseConfigured() in
 * growth-coach/adapters/supabase.ts, which only requires the URL + service
 * role key for lead storage — auth additionally needs the ANON key,
 * because the browser client and the per-request SSR client both use it
 * (safe to expose: it's designed to be public, protected entirely by RLS).
 */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
