"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Built around the approved before/after artwork
 * (public/images/HomePage/The-Shift-Before-After.png). The image carries
 * the visual weight on its own — no redundant native-text strip
 * underneath re-explaining what it already shows.
 */
export function TransformationSection() {
  return (
    <section className="relative overflow-hidden bg-paper-200 py-16 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-purple-200/25 blur-3xl" />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-3 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            What a Stronger Online Presence Can Change
          </p>
          <h2 className="balance text-display-lg text-ink-900">
            Make It Easier for Customers to Find You, Trust You, and Choose You.
          </h2>
          <p className="mt-4 text-subhead text-ink-600">
            Your website should do more than exist. It should clearly show who you are, what you do,
            and how someone can take the next step.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="relative mx-auto mt-12 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lifted">
            <Image
              src="/images/HomePage/The-Shift-Before-After.png"
              alt="Before and after: a plumbing business's outdated, hard-to-find website transformed into a clear, professional, credible website and mobile experience"
              width={1693}
              height={929}
              sizes="(min-width: 1024px) 1000px, 100vw"
              className="h-auto w-full"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br from-teal-200 via-blue-200 to-purple-200 opacity-40 blur-sm"
          />
          <p className="mt-3 text-center text-xs text-ink-400">Concept example — shown for illustration only.</p>
        </motion.div>
      </Container>
    </section>
  );
}
