"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";

const transformations = [
  { before: "Hard to find", after: "Easier to discover" },
  { before: "Difficult to trust", after: "Stronger online credibility" },
  { before: "Inconsistent inquiries", after: "Clearer lead capture" },
  { before: "Disconnected marketing", after: "One connected growth system" },
];

/**
 * "The Shift" — redesigned around the approved before/after artwork
 * (public/images/HomePage/The-Shift-Before-After.png) instead of the old
 * paired Before/After text cards. The image carries the visual weight; the
 * compact row below exists only for accessibility/SEO, since the
 * transformation claims baked into an <img> aren't otherwise real text on
 * the page.
 */
export function TransformationSection() {
  return (
    <section className="relative overflow-hidden bg-paper-200 py-20 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-purple-200/25 blur-3xl" />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-3 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            The Shift
          </p>
          <h2 className="balance text-display-lg text-ink-900">From Overlooked Online to Impossible to Miss</h2>
          <p className="mt-4 text-subhead text-ink-600">
            Here&rsquo;s what changes when your digital presence finally matches how good your business really is.
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
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.08)}
          className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-ink-100"
        >
          {transformations.map((item) => (
            <motion.div key={item.before} variants={fadeUp} className="flex flex-col items-center gap-1 text-center lg:px-3">
              <span className="text-xs font-medium text-ink-400">{item.before}</span>
              <ArrowDown className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
              <span className="text-sm font-semibold text-ink-900">{item.after}</span>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
