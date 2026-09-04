import { Button } from "@/components/ui/Button";
import { CTABanner } from "@/components/ui/CTABanner";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { primaryCta } from "@/lib/site-config";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { Eye, MousePointerClick, Sparkles, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

const founderDetails = [
  "Nevada Based",
  "Lean Six Sigma Mindset",
  "Ultramarathon Runner",
  "Husband & Father",
];

const principles: { title: string; copy: string; icon: LucideIcon }[] = [
  {
    title: "Look Professional",
    copy: "Your website should reflect the quality of your business.",
    icon: Sparkles,
  },
  {
    title: "Make It Clear",
    copy: "Customers should understand what you do within seconds.",
    icon: Eye,
  },
  {
    title: "Make the Next Step Easy",
    copy: "Calls, forms, and booking should never be hard to find.",
    icon: MousePointerClick,
  },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "About Next Level Growth: a web design and digital growth company based in Reno, Nevada, building professional websites for businesses everywhere.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <AnalyticsBeacon event="page_view" pagePath="/about" />
      <PageHero
        eyebrow="About"
        title="Great Businesses Deserve a Website That Shows It."
        description="Too many businesses do excellent work but look average online. Next Level Growth exists to close that gap."
        ctaLabel="Let's Build Yours"
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <div>
              <p className="text-eyebrow text-gradient-brand">Our Philosophy</p>
              <h2 className="mt-3 balance text-display-md text-ink-900">
                A great business can still get overlooked online.
              </h2>
              <p className="mt-4 max-w-md text-body text-ink-600">
                A stronger website gives customers a clearer reason to trust you and an easier way to
                reach you. Next Level Growth exists to help you build that, then connect the right
                tools around it as you grow.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-4">
              {principles.map((principle) => (
                <li key={principle.title} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white">
                    <principle.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink-900">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{principle.copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container className="max-w-5xl">
          <p className="text-eyebrow text-gradient-brand">Meet the Founder</p>

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
                    <span className="h-1 w-1 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
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
              <Button href={primaryCta.href}>{primaryCta.label}</Button>
            </div>
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
