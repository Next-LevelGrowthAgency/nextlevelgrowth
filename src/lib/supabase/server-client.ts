import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseAuthConfigured } from "./config";

/**
 * Per-request Supabase client for Server Components, Route Handlers, and
 * Server Actions — uses the ANON key + the visitor's own session cookie,
 * so every query still goes through RLS as that specific user (never the
 * service-role key; that stays isolated to
 * growth-coach/adapters/supabase.ts for lead-storage writes only).
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Supabase Auth is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). See .env.example.");
  }
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render, where cookies are
          // read-only — safe to ignore because src/middleware.ts already
          // refreshes the session on every request that needs it.
        }
      },
    },
  });
}
