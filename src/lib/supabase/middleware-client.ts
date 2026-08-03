import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseAuthConfigured } from "./config";

/**
 * Refreshes the Supabase session cookie on every matched request — the
 * standard @supabase/ssr middleware pattern. Must run before any Server
 * Component reads the session, or a nearly-expired token can silently fail
 * mid-render. Returns the (possibly cookie-updated) response alongside the
 * client so middleware.ts can also read the current user off it.
 */
export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseAuthConfigured()) {
    return { supabase: null, response };
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  return { supabase, response };
}
