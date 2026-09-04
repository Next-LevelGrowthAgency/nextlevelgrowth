import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  robots: { index: false, follow: false },
};

/**
 * Shared login route for both the client portal (/portal) and the owner
 * admin dashboard (/admin) — middleware redirects unauthenticated
 * requests to either one here with ?next= set accordingly. The `next`
 * param decides which copy renders and whether LoginForm shows the
 * client-signup link: an owner landing here from /admin should never see
 * "Create an account."
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const isAdminLogin = next?.startsWith("/admin") ?? false;

  return (
    <AuthShell
      title={isAdminLogin ? "Next Level Growth — Owner Dashboard" : "Log In"}
      description={isAdminLogin ? "Sign in to view website activity and inquiries." : "Access your Next Level Growth client portal."}
    >
      <Suspense fallback={null}>
        <LoginForm hideSignupLink={isAdminLogin} />
      </Suspense>
    </AuthShell>
  );
}
