import { ConceptPortfolio } from "@/components/home/ConceptPortfolio";
import { EmpathySection } from "@/components/home/EmpathySection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { GrowthFramework } from "@/components/home/GrowthFramework";
import { Hero } from "@/components/home/Hero";
import { Industries } from "@/components/home/Industries";
import { ProofSection } from "@/components/home/ProofSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { TransformationSection } from "@/components/home/TransformationSection";
import { WhyUs } from "@/components/home/WhyUs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";
import { faqs, siteConfig } from "@/lib/site-config";
import { testimonials } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteConfig.tagline,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Hero />
      <EmpathySection />
      <TransformationSection />
      <ServicesOverview />
      <GrowthFramework />
      <WhyUs />
      <ConceptPortfolio />
      <ProofSection />
      <Industries />
      {/* Renders nothing until real, verified testimonials exist in site-config.ts */}
      <Testimonials items={testimonials} />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
