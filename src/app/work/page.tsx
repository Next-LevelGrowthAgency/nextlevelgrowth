import { ConceptPortfolio } from "@/components/home/ConceptPortfolio";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHero } from "@/components/ui/PageHero";
import { primaryCta } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A look at how Next Level Growth approaches strategy and design across industries — clearly labeled concept and demonstration projects.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="A Look at How We Think and Build"
        description="Until we can show real client results here, these concept projects demonstrate our strategic and design approach across different industries. Every project below is clearly labeled — none represent an actual paid engagement."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />
      <ConceptPortfolio />
      <CTABanner />
    </>
  );
}
