import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { primaryCta } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Next Level Growth exists, and the philosophy behind how we help local businesses grow.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Why Next Level Growth Exists"
        description="Too many local businesses are doing great work and getting overlooked online, not because they lack quality, but because their digital presence doesn't reflect it."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container className="max-w-3xl space-y-6 text-lg leading-relaxed text-ink-700">
          <p>
            Next Level Growth was built around a simple observation: the
            businesses that deserve to be found aren&rsquo;t always the ones
            that are. A great local business can lose customers to a
            competitor with a better website, a stronger Google presence, or
            simply a clearer next step for visitors to take.
          </p>
          <p>
            We exist to close that gap, translating websites, SEO,
            marketing, and automation into a strategy that&rsquo;s actually
            built around your goals, your customers, and your budget. Not
            generic best practices. Not one-size-fits-all packages.
          </p>
          <p>
            We believe growth should feel clearer, not more complicated. That
            means honest recommendations, plain-English communication, and a
            long-term view of your business rather than a single project.
          </p>

        </Container>
      </Section>

      <Section tone="paper">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-grove-700">Founder</p>
          <h2 className="mt-2 font-display text-display-md text-ink-900">Dimitri Del Peloso</h2>
          <p className="mt-1 text-ink-600">Founder, Next Level Growth</p>

          <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-700">
            <p>
              Dimitri Del Peloso founded Next Level Growth with a belief that small and growing businesses deserve
              access to strong strategy, modern technology, and practical digital-growth systems.
            </p>
            <p>
              His professional background is rooted in leadership, operations, continuous improvement,
              problem-solving, and developing high-performing teams. Throughout his career, Dimitri has focused on
              identifying gaps, improving systems, measuring results, and helping people turn uncertainty into clear
              action.
            </p>
            <p>
              That approach shapes Next Level Growth. Rather than offering generic websites or one-size-fits-all
              marketing, every engagement begins by understanding the business, its customers, its goals, and the
              obstacles preventing growth.
            </p>
            <p>
              Next Level Growth combines custom website development, digital strategy, SEO, lead generation,
              automation, and AI-powered tools to help businesses create stronger foundations and move confidently
              toward their next level.
            </p>
            <p>
              Dimitri&rsquo;s leadership philosophy centers on accountability, discipline, practical execution,
              continuous improvement, and genuine service. His goal is not simply to deliver a website. It is to
              help business owners build a stronger system for long-term growth.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-ink-100 bg-white p-8 shadow-soft">
            <p className="font-display text-2xl text-ink-900">
              Let&rsquo;s identify what is holding your business back and build what comes next.
            </p>
            <div className="mt-5">
              <Button href={primaryCta.href}>Start Your Free Growth Assessment</Button>
            </div>
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
