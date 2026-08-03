import { ComingSoon } from "@/components/portal/ComingSoon";
import { getPortalSession } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function PortalMessagesPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal/messages");

  return <ComingSoon title="Messages" description="Direct messaging with your Next Level Growth team will appear here once this feature ships. For now, reply to any of our emails." />;
}
