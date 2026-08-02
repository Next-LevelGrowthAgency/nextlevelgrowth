import { getAdminSession } from "@/lib/growth-coach/auth/guard";
import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { SESSION_COOKIE_NAME } from "@/lib/growth-coach/auth/session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  recordAuditEvent("admin_logout", session?.role ?? "unknown");

  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
