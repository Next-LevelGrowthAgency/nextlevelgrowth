import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/growth-coach/auth/session";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware-client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";

/**
 * Server-side gate for /admin/* and session-refresh for /portal/* — runs
 * on the Edge runtime BEFORE any page code executes, so it cannot be
 * bypassed by disabling client JS or hitting a page URL directly.
 *
 * Two auth systems can be active here, and this file is what decides
 * which one governs a given request:
 *
 * 1. Real Supabase Auth (once NEXT_PUBLIC_SUPABASE_URL and
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY are set) — proves "a signed-in Supabase
 *    user exists" for /admin/*; the ROLE check (owner/admin vs. everyone
 *    else) happens one layer up, in src/app/admin/layout.tsx via
 *    getEffectiveAdminSession(), so an authenticated-but-unauthorized user
 *    gets a proper 403 page instead of being redirected back to login.
 * 2. The pre-existing dev-grade single-shared-password session (see
 *    growth-coach/auth/session.ts) — used ONLY when Supabase Auth isn't
 *    configured, and still hard-blocked in production exactly as before,
 *    independent of whether the dev-password env vars happen to be set.
 *    This fallback exists purely so /admin/* remains reachable in local
 *    dev/preview before a real Supabase project is connected.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh the Supabase session cookie first (a no-op if
  // Supabase Auth isn't configured) so /portal/* and /admin/* Server
  // Components never see a stale/expired token mid-render.
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/unavailable")) {
      return response;
    }

    if (isSupabaseAuthConfigured() && supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
        return NextResponse.redirect(loginUrl);
      }
      // Authenticated — role authorization happens in admin/layout.tsx.
      return response;
    }

    // No real auth provider connected — same production hard block as
    // before, intentionally independent of the dev-password env vars.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.rewrite(new URL("/admin/unavailable", request.url));
    }

    if (pathname.startsWith("/admin/login")) {
      return response;
    }

    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if (pathname.startsWith("/portal") && isSupabaseAuthConfigured() && supabase) {
    // The layout (src/app/portal/layout.tsx) also checks this — this is
    // the defense-in-depth copy, and the reason it's worth having here
    // too: this layer knows the exact requested pathname, so `next=`
    // preserves e.g. /portal/profile instead of collapsing every deep
    // link back to the /portal root.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
