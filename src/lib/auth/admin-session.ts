import { getAdminSession, isAuthorizedForLeadData } from "@/lib/growth-coach/auth/guard";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

/**
 * ONE function every /admin/* page and Server Action calls to find out who
 * (if anyone) is allowed to see admin data — never a hidden-nav-link check,
 * never a client-side email comparison. When Supabase Auth is configured,
 * this is REAL production auth: a Supabase session + a `role` read from
 * the `profiles` table (through RLS, not a hard-coded list). When it is
 * NOT configured, this transparently falls back to the pre-existing
 * dev-grade single-shared-password session (see
 * growth-coach/auth/guard.ts) — which middleware.ts still hard-blocks in
 * production regardless, so that fallback is dev/preview-only either way.
 */
export type EffectiveAdminSession =
  | { authenticated: true; authorized: true; role: "owner" | "admin"; source: "supabase" | "dev"; userId?: string; email?: string }
  | { authenticated: true; authorized: false; role: string; source: "supabase" | "dev" }
  | { authenticated: false; source: "supabase" | "dev" };

export async function getEffectiveAdminSession(): Promise<EffectiveAdminSession> {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { authenticated: false, source: "supabase" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role ?? "prospect";

    if (role === "owner" || role === "admin") {
      return { authenticated: true, authorized: true, role, source: "supabase", userId: user.id, email: user.email ?? undefined };
    }
    return { authenticated: true, authorized: false, role, source: "supabase" };
  }

  const devSession = await getAdminSession();
  if (!devSession) return { authenticated: false, source: "dev" };
  if (isAuthorizedForLeadData(devSession)) {
    return { authenticated: true, authorized: true, role: devSession.role as "owner" | "admin", source: "dev" };
  }
  return { authenticated: true, authorized: false, role: devSession.role, source: "dev" };
}
