import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { sanitizeRedirectPath } from "@/lib/safe-redirect";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Handles the redirect from a Supabase confirmation/magic-link/password-
 * reset email — exchanges the one-time `code` for a real session cookie,
 * then forwards to wherever the email said to go next (defaults to the
 * portal). If the code is missing, invalid, or already used, sends the
 * visitor to login with an error rather than silently landing on a page
 * that will just look broken without a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"), "/portal");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link-expired`);
}
