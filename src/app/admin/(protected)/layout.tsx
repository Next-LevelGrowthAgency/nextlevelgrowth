import { Container } from "@/components/ui/Container";
import { getEffectiveAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/audits", label: "Growth Audits" },
  { href: "/admin/email-events", label: "Email Delivery" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/diagnostics", label: "Diagnostics" },
];

/**
 * Server-side role gate for the ENTIRE /admin/* tree (except
 * /admin/unavailable and /admin/login, which src/middleware.ts already
 * exempts before this ever runs). Two distinct outcomes:
 *   - Not authenticated at all -> redirect to login (middleware normally
 *     catches this first when Supabase is configured; this is the
 *     defense-in-depth backstop, and the only path taken at all when
 *     Supabase isn't configured, since middleware's dev-session check
 *     already ran by the time we get here).
 *   - Authenticated but role isn't owner/admin -> 403, never a redirect
 *     loop back to a login page they already passed.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getEffectiveAdminSession();

  if (!session.authenticated) {
    redirect(session.source === "supabase" ? "/login?next=/admin" : "/admin/login");
  }

  if (!session.authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-lifted">
          <h1 className="font-display text-xl font-semibold text-ink-900">403 — Not authorized</h1>
          <p className="mt-2 text-sm text-ink-600">Your account (role: &ldquo;{session.role}&rdquo;) doesn&rsquo;t have access to the admin dashboard.</p>
          <Link href="/portal" className="mt-4 inline-block text-sm font-medium text-grove-700 underline hover:text-grove-900">
            Go to your portal instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-100">
      <div className="border-b border-ink-100 bg-ink-900 text-paper-100">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="font-display text-lg font-semibold">Next Level Growth — Admin</p>
            <p className="text-xs text-paper-400">
              {session.email ?? "Dev session"} · {session.role}
              {session.source === "dev" ? " · dev-grade auth" : ""}
            </p>
          </div>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {ADMIN_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 text-sm text-paper-200 hover:bg-ink-800">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={session.source === "supabase" ? "/api/auth/logout" : "/api/admin/logout"} method="POST">
            <button type="submit" className="text-sm font-medium text-paper-300 underline hover:text-paper-100">
              Log out
            </button>
          </form>
        </Container>
      </div>
      <Container className="py-10">{children}</Container>
    </div>
  );
}
