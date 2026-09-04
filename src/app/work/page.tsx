import { ConceptPortfolio } from "@/components/home/ConceptPortfolio";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHero } from "@/components/ui/PageHero";
import { primaryCta } from "@/lib/site-config";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Design Examples",
  description:
    "Web design examples from Next Level Growth showing our approach to strategy and design across industries. Clearly labeled concept and demonstration projects.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <AnalyticsBeacon event="page_view" pagePath="/work" />
      <PageHero
        eyebrow="Our Work"
        title="Ideas Built to Show What's Possible"
        description="Explore website concepts designed around different industries, styles, and customer needs. Use them as inspiration for what we could build around your business."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />
      <ConceptPortfolio />
      <CTABanner />
    </>
  );
}
