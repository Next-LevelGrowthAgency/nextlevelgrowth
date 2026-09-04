import { sanitizeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Shared by both the client portal and admin dashboard logout buttons — each posts with its own ?redirect= so a signed-out owner lands back on /admin/login, not the portal's /login. */
export async function POST(request: NextRequest) {
  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  const redirectTo = sanitizeRedirectPath(request.nextUrl.searchParams.get("redirect"), "/login");
  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}
