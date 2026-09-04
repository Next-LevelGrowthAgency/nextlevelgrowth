import { Container } from "@/components/ui/Container";
import { getEffectiveAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import Link from "next/link";

const PRIMARY_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/traffic", label: "Traffic" },
  { href: "/admin/leads", label: "Inquiries" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/performance", label: "Performance" },
];

const MORE_NAV = [
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
          <Link href="/portal" className="mt-4 inline-block text-sm font-medium text-blue-600 underline hover:text-blue-800">
            Go to your portal instead
          </Link>
        </div>
      </div>
    );
  }

  const logoutAction = session.source === "supabase" ? "/api/auth/logout?redirect=/admin/login" : "/api/admin/logout";

  return (
    <div className="min-h-screen bg-paper-100 lg:flex">
      <aside className="border-b border-ink-800 bg-ink-900 text-paper-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="p-6">
          <p className="font-display text-base font-semibold">Next Level Growth</p>
          <p className="text-xs text-paper-400">Owner Dashboard</p>
        </div>

        <nav aria-label="Admin" className="flex flex-wrap gap-1 px-4 pb-4 lg:flex-1 lg:flex-col lg:flex-nowrap lg:gap-0.5 lg:overflow-y-auto lg:px-3">
          {PRIMARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 text-sm text-paper-200 hover:bg-ink-800 lg:rounded-lg lg:px-3 lg:py-2">
              {item.label}
            </Link>
          ))}
          <div className="my-2 hidden w-full border-t border-ink-800 lg:block" />
          {MORE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 text-sm text-paper-300 hover:bg-ink-800 lg:rounded-lg lg:px-3 lg:py-2 lg:text-paper-400">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-800 p-4">
          <p className="truncate text-xs text-paper-400">
            {session.email ?? "Dev session"} · {session.role}
            {session.source === "dev" ? " · dev-grade auth" : ""}
          </p>
          <form action={logoutAction} method="POST" className="mt-2">
            <button type="submit" className="text-sm font-medium text-paper-300 underline hover:text-paper-100">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <Container className="py-10">{children}</Container>
      </div>
    </div>
  );
}
