import { Container } from "@/components/ui/Container";
import { getPortalSession } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import Link from "next/link";

const PORTAL_NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/requests", label: "My Requests" },
  { href: "/portal/reports", label: "Reports" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/settings", label: "Settings" },
];

/**
 * Server-side auth gate for the ENTIRE /portal/* tree — every page under
 * this layout can assume a real, authenticated Supabase session exists.
 * Never relies on hiding nav links: an unauthenticated (or Supabase-not-
 * configured) request is redirected before any portal page component runs.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal");

  return (
    <div className="min-h-screen bg-paper-100">
      <div className="border-b border-ink-100 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="font-display text-lg font-semibold text-ink-900">Client Portal</p>
            <p className="text-xs text-ink-500">Signed in as {session.email}</p>
          </div>
          <nav aria-label="Portal" className="flex flex-wrap gap-1">
            {PORTAL_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 text-sm text-ink-700 hover:bg-ink-100">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm font-medium text-ink-600 underline hover:text-ink-900">
              Log out
            </button>
          </form>
        </Container>
      </div>
      <Container className="py-10">{children}</Container>
    </div>
  );
}
