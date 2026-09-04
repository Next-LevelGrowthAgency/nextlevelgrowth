import { ApproachFinalCTA } from "@/components/approach/ApproachFinalCTA";
import { ApproachHero } from "@/components/approach/ApproachHero";
import { ApproachIntro } from "@/components/approach/ApproachIntro";
import { ApproachMoment } from "@/components/approach/ApproachMoment";
import { ApproachProcess } from "@/components/approach/ApproachProcess";
import { ApproachWhyUs } from "@/components/approach/ApproachWhyUs";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Web Design Process",
  description:
    "How Next Level Growth approaches web design and digital growth: understand your business, plan the right site and tools, build, launch, and keep improving.",
  alternates: { canonical: "/approach" },
};

export default function ApproachPage() {
  return (
    <>
      <AnalyticsBeacon event="page_view" pagePath="/approach" />
      <AnalyticsBeacon event="approach_view" pagePath="/approach" />
      <JsonLd data={breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Our Approach", url: "/approach" }])} />

      <ApproachHero />
      <ApproachIntro />
      <ApproachProcess />
      <ApproachMoment />
      <ApproachWhyUs />
      <ApproachFinalCTA />
    </>
  );
}
