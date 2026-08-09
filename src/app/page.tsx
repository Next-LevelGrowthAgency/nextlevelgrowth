import { EmpathySection } from "@/components/home/EmpathySection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { HomeConceptPortfolio } from "@/components/home/HomeConceptPortfolio";
import { HomeGrowthFramework } from "@/components/home/HomeGrowthFramework";
import { HomeWhyUs } from "@/components/home/HomeWhyUs";
import { Industries } from "@/components/home/Industries";
import { ProofSection } from "@/components/home/ProofSection";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { TransformationSection } from "@/components/home/TransformationSection";
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
      <HomeGrowthFramework />
      <HomeWhyUs />
      <HomeConceptPortfolio />
      <ProofSection />
      <Industries />
      {/* Renders nothing until real, verified testimonials exist in site-config.ts */}
      <Testimonials items={testimonials} />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
