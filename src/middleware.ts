import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/growth-coach/auth/session";

/**
 * Server-side gate for the owner dashboard — runs on the Edge runtime for
 * every /admin/* request BEFORE any page code executes, so this cannot be
 * bypassed by disabling client JS or hitting a page URL directly. This is
 * real enforcement, not "the route name is obscure." It's still a
 * dev-grade single-shared-credential session, though — see the production
 * auth recommendation before deploying.
 *
 * Role checks (owner/admin vs. staff) happen at the page/data layer
 * (auth/guard.ts), not here — this layer only proves "a valid session
 * exists," matching how a real reverse-proxy/edge auth check would be
 * scoped in production.
 *
 * Production hard block: no real auth provider is connected yet, so in
 * production every /admin/* request is rewritten to a static "not
 * available" page before the dev login/session logic ever runs. This is
 * intentionally independent of whether GROWTH_COACH_ADMIN_DEV_PASSWORD_HASH
 * / GROWTH_COACH_SESSION_SECRET happen to be set — the dev dashboard must
 * stay unreachable in production even if those env vars are misconfigured.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/unavailable")) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.rewrite(new URL("/admin/unavailable", request.url));
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
