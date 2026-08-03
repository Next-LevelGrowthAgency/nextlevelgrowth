import { ComingSoon } from "@/components/portal/ComingSoon";
import { getPortalSession } from "@/lib/auth/portal-session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reports", robots: { index: false, follow: false } };

export default async function PortalReportsPage() {
  const session = await getPortalSession();
  if (!session) redirect("/login?next=/portal/reports");

  return <ComingSoon title="Reports" description="Growth Score history, saved Business Growth Reports, and progress tracking will appear here once this feature ships." />;
}
