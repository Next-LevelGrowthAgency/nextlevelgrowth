/**
 * Validates a `next=` redirect target from a query string before it's ever
 * passed to router.push()/NextResponse.redirect() — used by /login,
 * /auth/callback, and anywhere else a post-auth destination comes from
 * user-controlled input. Only a same-origin, path-only value is allowed:
 * rejects absolute URLs (https://evil.com), protocol-relative ones
 * (//evil.com), and anything that doesn't start with a single `/`.
 */
export function isSafeRedirectPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false; // some browsers treat \ as / in URLs
  return true;
}

export function sanitizeRedirectPath(path: string | null | undefined, fallback: string): string {
  return isSafeRedirectPath(path) ? path : fallback;
}
