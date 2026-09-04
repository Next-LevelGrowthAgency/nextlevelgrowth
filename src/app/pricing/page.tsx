import { JsonLd } from "@/components/seo/JsonLd";
import { CustomSolutions } from "@/components/pricing/CustomSolutions";
import { GrowthJourney } from "@/components/pricing/GrowthJourney";
import { NextLevelSystem } from "@/components/pricing/NextLevelSystem";
import { PackageComparison } from "@/components/pricing/PackageComparison";
import { PackageSection } from "@/components/pricing/PackageSection";
import { PricingExplanation } from "@/components/pricing/PricingExplanation";
import { PricingFinalCTA } from "@/components/pricing/PricingFinalCTA";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingOverview } from "@/components/pricing/PricingOverview";
import { breadcrumbSchema } from "@/lib/schema";
import { getPackageById } from "@/lib/pricing-content";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Design Pricing & Packages",
  description:
    "Website design pricing and digital growth packages from Next Level Growth: professional websites, local SEO, Google Business optimization, AI, and automation.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const foundation = getPackageById("foundation")!;
  const launch = getPackageById("launch")!;
  const growth = getPackageById("growth")!;
  const nextLevel = getPackageById("nextLevel")!;

  return (
    <>
      <AnalyticsBeacon event="page_view" pagePath="/pricing" />
      <AnalyticsBeacon event="pricing_view" pagePath="/pricing" />
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Pricing", url: "/pricing" }])} />

      <PricingHero />
      <PricingOverview />

      <PackageSection pkg={foundation} imageSide="right" />
      <PackageSection pkg={launch} imageSide="left" />
      <PackageSection pkg={growth} imageSide="right" tone="tint">
        <GrowthJourney />
      </PackageSection>
      <PackageSection pkg={nextLevel} imageSide="left" tone="tint">
        <NextLevelSystem />
      </PackageSection>

      <PackageComparison />
      <CustomSolutions />
      <PricingExplanation />
      <PricingFinalCTA />
    </>
  );
}
