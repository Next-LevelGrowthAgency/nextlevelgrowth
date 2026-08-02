import { recordAuditEvent } from "@/lib/growth-coach/audit";
import { verifyDevPassword } from "@/lib/growth-coach/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/growth-coach/auth/session";
import { isRateLimited } from "@/lib/rate-limit";
import type { AdminRole } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_ROLES: AdminRole[] = ["owner", "admin", "staff"];

/**
 * DEVELOPMENT-ONLY LOGIN. A single shared password (hashed, from
 * GROWTH_COACH_ADMIN_DEV_PASSWORD_HASH) plus a role picker that exists
 * purely so the different role-based authorization behaviors (owner/admin
 * see lead data, staff does not) can actually be exercised locally without
 * a real user table. Never use a role picker like this in production —
 * see the auth-provider recommendation in the completion report.
 */
export async function POST(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";

  // Defense in depth: src/middleware.ts already rewrites every /admin/*
  // page to /admin/unavailable in production, but this API route is not
  // covered by that matcher, so it refuses independently here too.
  if (isProduction) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const roleInput = String(formData.get("role") ?? "owner");
  const role: AdminRole = VALID_ROLES.includes(roleInput as AdminRole) ? (roleInput as AdminRole) : "owner";

  if (isRateLimited("admin-login", ip, 60_000, 5)) {
    recordAuditEvent("admin_login_failed", "unknown", { detail: "rate-limited" });
    return NextResponse.redirect(new URL("/admin/login?error=rate-limited", request.url), { status: 303 });
  }

  const storedHash = process.env.GROWTH_COACH_ADMIN_DEV_PASSWORD_HASH;
  if (!storedHash || !verifyDevPassword(password, storedHash)) {
    recordAuditEvent("admin_login_failed", "unknown");
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), { status: 303 });
  }

  const token = await createSessionToken(role);
  recordAuditEvent("admin_login", role);

  const response = NextResponse.redirect(new URL("/admin/growth-coach-leads", request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}
