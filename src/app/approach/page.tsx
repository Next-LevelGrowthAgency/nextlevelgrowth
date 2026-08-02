import { CTABanner } from "@/components/ui/CTABanner";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { GrowthFramework } from "@/components/home/GrowthFramework";
import { WhyUs } from "@/components/home/WhyUs";
import { primaryCta } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "The Next Level Growth Framework: Discover, Clarify, Build, Launch, Grow. A clear, repeatable path from where your business is to where it's ready to go.",
  alternates: { canonical: "/approach" },
};

export default function ApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Approach"
        title="A Clear Process, Not a Black Box"
        description="You shouldn't have to wonder what's happening with your project or why. Here's exactly how we work, from the first conversation to ongoing growth."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container className="max-w-3xl">
          <p className="text-lg leading-relaxed text-ink-700">
            Great digital marketing and web design don&rsquo;t start with a
            template. They start with understanding your business. The Next
            Level Growth Framework is the same five-stage process we use with
            every client, adapted to your industry, your goals, and your
            budget. It exists so you always know what&rsquo;s happening next
            and why.
          </p>
        </Container>
      </Section>

      <GrowthFramework />
      <WhyUs />
      <CTABanner />
    </>
  );
}
