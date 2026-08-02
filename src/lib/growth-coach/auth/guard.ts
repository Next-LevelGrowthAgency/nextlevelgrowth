import type { AdminSessionPayload } from "@/types";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

/** Server Components / Server Actions only (uses next/headers). */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export function isAuthorizedForLeadData(session: AdminSessionPayload | null): boolean {
  return session?.role === "owner" || session?.role === "admin";
}
