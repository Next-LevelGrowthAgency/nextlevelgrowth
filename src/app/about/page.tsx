import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { primaryCta } from "@/lib/site-config";
import type { Metadata } from "next";
import Image from "next/image";

const founderDetails = [
  "Nevada Based",
  "Lean Six Sigma Mindset",
  "Ultramarathon Runner",
  "Husband & Father",
];

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
        <Container className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-grove-700">Meet the Founder</p>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
            <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lifted">
                <Image
                  src="/images/brand/founder-dimitri.jpg"
                  alt="Dimitri Del Peloso, founder of Next Level Growth"
                  fill
                  sizes="(min-width: 1024px) 340px, (min-width: 640px) 384px, 80vw"
                  className="object-cover"
                />
              </div>

              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-ink-100 pt-6 text-sm text-ink-600 lg:grid-cols-1">
                {founderDetails.map((detail) => (
                  <li key={detail} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-grove-500" aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-display-md text-ink-900">Dimitri Del Peloso</h2>
              <p className="mt-1 text-ink-600">Founder, Next Level Growth</p>

              <div className="mt-6 max-w-prose space-y-5 text-lg leading-relaxed text-ink-700">
                <p>
                  I&rsquo;m a husband, father of two, Christian, ultramarathon runner, and someone who has called
                  Nevada home for more than a decade. My faith in Jesus Christ and my family are a big part of who I
                  am and how I try to lead, serve, and do business.
                </p>
                <p>
                  Professionally, much of my background has centered around leadership, continuous improvement, and
                  Lean Six Sigma principles. I&rsquo;ve spent years learning how to look at a process, find what is
                  holding it back, remove unnecessary waste, and build better systems that produce better results.
                  That same mindset is at the heart of Next Level Growth.
                </p>
                <p>
                  Running ultramarathons teaches you that meaningful progress rarely comes from one huge
                  breakthrough. It comes through discipline, solving problems as they come, and continuing to move
                  forward. That&rsquo;s the same mindset I bring into the work I do with businesses.
                </p>
                <p>
                  My mission with Next Level Growth is simple: help businesses get more exposure, reach more of the
                  right people, and create better opportunities to grow. Whether that means improving your website,
                  strengthening your online presence, or helping you use better systems and technology, the goal is
                  always the same: move your business forward.
                </p>
                <p>
                  I want people to know who they&rsquo;re working with. I&rsquo;m not interested in building
                  something and disappearing. I want to understand your business, what matters to you, and where
                  you&rsquo;re trying to go, then help you build toward that next level.
                </p>
              </div>
            </div>
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
