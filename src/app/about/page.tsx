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
        description="Too many local businesses are doing great work and getting overlooked online — not because they lack quality, but because their digital presence doesn't reflect it."
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
            We exist to close that gap — translating websites, SEO,
            marketing, and automation into a strategy that&rsquo;s actually
            built around your goals, your customers, and your budget. Not
            generic best practices. Not one-size-fits-all packages.
          </p>
          <p>
            We believe growth should feel clearer, not more complicated. That
            means honest recommendations, plain-English communication, and a
            long-term view of your business rather than a single project.
          </p>

          <div className="rounded-2xl border border-dashed border-ink-300 bg-paper-200 p-6 text-base text-ink-600">
            <p className="font-semibold text-ink-800">Placeholder — Founder / Team Bio</p>
            <p className="mt-2">
              This section is intentionally left as an editable placeholder.
              Add your real name, background, and photo here before launch —
              see CONTENT-GUIDE.md for instructions. We do not fabricate
              founder biographies.
            </p>
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
