"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryCta, secondaryCta, trustStatement } from "@/lib/site-config";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

/**
 * Hero — the highest-stakes section on the site. Background is the Reno
 * skyline photo (public/images/brand/hero-reno-growth.png); its own dark
 * negative space sits on the left, so the gradient overlay below only needs
 * to reinforce contrast at narrow viewports where that dark zone compresses.
 */
export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink-900 text-paper-100">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image
          src="/images/brand/hero-reno-growth.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[65%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/70 to-transparent sm:via-ink-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
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
