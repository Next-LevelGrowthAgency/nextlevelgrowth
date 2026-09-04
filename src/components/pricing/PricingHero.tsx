"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const capabilityStrip = "Web Design • SEO • Google • AI • Automation • Ongoing Support";

/**
 * Large split hero: real HTML copy on the left, the approved pricing cover
 * artwork as a big framed visual on the right. Deliberately not a full-bleed
 * image background — the cover art already has its own baked-in wordmark and
 * headline, so overlaying more text on top of it would duplicate messaging
 * and bury real copy inside an image. Side-by-side keeps the artwork as a
 * prominent, legible visual while every claim on the page stays real text.
 */
export function PricingHero() {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpProps = (delay: number) => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
  });

  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-paper-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />

      <Container className="relative grid grid-cols-1 items-center gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-10 lg:py-20">
        <div>
          <motion.p {...fadeUpProps(0)} className="text-eyebrow mb-5 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Website &amp; Digital Growth Pricing
          </motion.p>

          <motion.h1 {...fadeUpProps(0.05)} className="balance text-display-2xl text-ink-900">
            Build the Website.{" "}
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choose How Far You Want to Grow.
            </span>
          </motion.h1>

          <motion.p {...fadeUpProps(0.15)} className="mt-6 max-w-lg text-subhead text-ink-600">
            Start with a professional website, ongoing support, or a full digital growth plan. Pick the
            level that fits your business today and expand when you&rsquo;re ready.
          </motion.p>

          <motion.div {...fadeUpProps(0.2)} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              href="#packages"
              size="lg"
              className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white shadow-soft hover:opacity-95 hover:shadow-lifted"
            >
              Explore Packages
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Talk With Us
            </Button>
          </motion.div>

          <motion.p {...fadeUpProps(0.25)} className="mt-8 text-sm font-medium tracking-wide text-ink-500">
            {capabilityStrip}
          </motion.p>
        </div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lifted">
            <Image
              src="/images/Pricing/Picing-cover.png"
              alt="Next Level Growth Agency: website design and digital growth packages built for business growth"
              width={1672}
              height={941}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-teal-200 via-blue-200 to-purple-200 opacity-60 sm:-bottom-6 sm:-right-6"
          />
        </motion.div>
      </Container>
    </section>
  );
}
