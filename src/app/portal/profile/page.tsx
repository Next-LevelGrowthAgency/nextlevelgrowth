import { ProfileForm } from "@/components/portal/ProfileForm";
import { getPortalSession } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function PortalProfilePage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal/profile");

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Profile</h1>
      <p className="mt-1 text-ink-600">Keep this up to date — we&rsquo;ll prefill it into future requests.</p>
      <div className="mt-8">
        <ProfileForm
          initialValues={{
            email: session.email,
            fullName: session.fullName ?? "",
            businessName: session.businessName ?? "",
            phone: session.phone ?? "",
          }}
        />
      </div>
    </div>
  );
}
