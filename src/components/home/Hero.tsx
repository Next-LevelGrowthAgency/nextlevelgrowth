"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryCta, secondaryCta, trustStatement } from "@/lib/site-config";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Hero — the highest-stakes section on the site. Deliberately avoids stock
 * photography of people pointing at laptops, handshakes, or rockets/mountains.
 * The visual is an abstract "scattered signals becoming one growth path"
 * composition, built entirely in CSS/SVG so it stays fast and on-brand
 * without depending on a licensed photo.
 */
export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-900 text-paper-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-10%] h-[520px] w-[520px] rounded-full bg-grove-600/20 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[420px] w-[420px] rounded-full bg-signal-500/15 blur-3xl" />
        <GrowthPathway reduced={!!prefersReducedMotion} />
      </div>

      <Container className="relative py-28 sm:py-36 lg:py-44">
        <div className="max-w-3xl">
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-eyebrow mb-6 text-grove-300"
          >
            For Local Businesses Ready to Grow
          </motion.p>

          <motion.h1
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="balance text-display-2xl"
          >
            More Customers Start With a Better Website.{" "}
            <span className="text-grove-300">Let&rsquo;s Build Yours.</span>
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="mt-6 max-w-xl text-subhead text-paper-300"
          >
            We build websites, get you found on Google, and handle the
            marketing that brings customers in.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
            </Button>
            <Button href={secondaryCta.href} variant="secondary" size="lg" className="border-paper-400 text-paper-100 hover:bg-white/10">
              {secondaryCta.label}
            </Button>
          </motion.div>

          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 text-body text-paper-400"
          >
            {trustStatement}
          </motion.p>
        </div>
      </Container>
    </section>
  );
}

/** Abstract, decorative "scattered points converging into one path" visual. */
function GrowthPathway({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute -right-24 top-1/2 hidden h-[600px] w-[800px] -translate-y-1/2 opacity-70 lg:block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3FBE8F" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3FBE8F" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {[
        "M60,480 C220,460 260,380 400,340",
        "M40,360 C200,380 260,340 400,320",
        "M80,220 C220,260 280,300 400,320",
        "M120,120 C240,180 300,260 400,300",
      ].map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="url(#pathGradient)"
          strokeWidth={1.5}
          strokeDasharray="4 6"
          className={reduced ? undefined : "animate-fade-in"}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <path
        d="M400,320 C520,300 560,260 700,240"
        fill="none"
        stroke="#3FBE8F"
        strokeWidth={2.5}
      />
      <circle cx="700" cy="240" r="6" fill="#3FBE8F" />
      {[
        [60, 480],
        [40, 360],
        [80, 220],
        [120, 120],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#5C82F2" opacity={0.6} />
      ))}
    </svg>
  );
}
