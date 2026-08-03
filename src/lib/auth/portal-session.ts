import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

export type PortalProfile = {
  id: string;
  email: string;
  fullName: string | null;
  businessName: string | null;
  phone: string | null;
  role: "owner" | "admin" | "team" | "client" | "prospect";
};

/** Server Components / Server Actions only. Returns null for any anonymous visitor — every /portal/* page must redirect to /login when this is null. */
export async function getPortalSession(): Promise<PortalProfile | null> {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? profile.email,
    fullName: profile.full_name ?? null,
    businessName: profile.business_name ?? null,
    phone: profile.phone ?? null,
    role: profile.role,
  };
}

/**
 * Cheaper than getPortalSession() (no profile fetch) — used by the public
 * submission routes (contact/growth-audit/growth-coach lead) purely to
 * decide whether to stamp `user_id` onto the lead they're about to create,
 * so "my requests" in the portal actually has something to show. Returns
 * null for anonymous visitors or when Supabase Auth isn't configured —
 * submissions must keep working either way.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
