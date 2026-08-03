import { ChangePasswordForm } from "@/components/portal/ChangePasswordForm";
import { getPortalSession } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };

export default async function PortalSettingsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal/settings");

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Settings</h1>
      <div className="mt-8 space-y-8">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">Change password</h2>
          <div className="mt-4">
            <ChangePasswordForm />
          </div>
        </div>
        <div className="border-t border-ink-100 pt-8">
          <h2 className="font-display text-lg font-semibold text-ink-900">Sign out everywhere</h2>
          <p className="mt-1 max-w-lg text-sm text-ink-600">Log out of this session.</p>
          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button type="submit" className="rounded-full border border-ink-300 px-5 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-900">
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
