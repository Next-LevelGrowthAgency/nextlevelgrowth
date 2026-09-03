"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * Full-bleed cinematic hero built around the approved mountain/path
 * artwork. The image already has its own baked-in wordmark and headline
 * in its upper-left third — the heavier-than-usual overlay there isn't
 * just for contrast, it also deliberately mutes that baked-in text so it
 * reads as atmosphere rather than competing with our real HTML headline
 * sitting on top of it.
 */
export function ApproachHero() {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpProps = (delay: number) => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay },
  });

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink-900 text-paper-100 sm:min-h-[75vh] lg:min-h-[80vh]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/images/Approach/approach-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/75 to-ink-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
      </div>

      <Container className="relative py-20 sm:py-24">
        <div className="max-w-2xl">
          <motion.p {...fadeUpProps(0)} className="text-eyebrow mb-5 text-teal-300">
            Our Approach
          </motion.p>

          <motion.h1 {...fadeUpProps(0.05)} className="balance text-display-2xl">
            A Clear Path to Your{" "}
            <span className="bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Next Level
            </span>
          </motion.h1>

          <motion.p {...fadeUpProps(0.12)} className="mt-6 max-w-xl text-subhead text-paper-200">
            Every business starts somewhere different. We take the time to understand where you are,
            where you want to go, and what will actually help you move forward.
          </motion.p>

          <motion.p {...fadeUpProps(0.18)} className="mt-3 max-w-xl text-body text-paper-400">
            Strategy, technology, and execution — built around your business and your goals.
          </motion.p>

          <motion.div {...fadeUpProps(0.25)} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              href="/growth-audit"
              size="lg"
              className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white shadow-soft hover:opacity-95 hover:shadow-lifted"
            >
              Get Your Free Growth Audit
            </Button>
            <Button href="#how-we-move-forward" variant="secondary" size="lg" className="border-paper-400 text-paper-100 hover:bg-white/10">
              See How We Work
            </Button>
          </motion.div>

          <motion.p {...fadeUpProps(0.3)} className="mt-8 text-sm font-medium tracking-wide text-paper-400">
            Understand. Build. Launch. Grow.
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
