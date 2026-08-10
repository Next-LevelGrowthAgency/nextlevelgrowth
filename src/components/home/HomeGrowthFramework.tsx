"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import type { FrameworkStage } from "@/types";

/**
 * Homepage-only copy variant of GrowthFramework.tsx — same structure and
 * styling, different (plainer) text. Exists because GrowthFramework.tsx
 * itself, and the frameworkStages data it reads from site-config.ts, are
 * also rendered on /approach — this component lets the homepage copy
 * pass differ without touching that shared component or shared data, so
 * /approach stays exactly as it was. See the homepage copy-rewrite
 * conversation for why this split exists; revisit /approach's own copy
 * as a separate pass later.
 */
const homeFrameworkStages: FrameworkStage[] = [
  {
    number: "01",
    title: "Discover",
    description: "We learn your business, your customers, and where you stand online today.",
  },
  {
    number: "02",
    title: "Clarify",
    description: "Together we figure out your message and your plan — built around what actually moves your business forward.",
  },
  {
    number: "03",
    title: "Build",
    description: "We build your website and everything behind it — made for your business, not copied from a template.",
  },
  {
    number: "04",
    title: "Launch",
    description: "We test everything, make sure it's fast, and put your new site live.",
  },
  {
    number: "05",
    title: "Grow",
    description: "We monitor results, refine strategy, and keep creating momentum. Growth is a direction, not a one-time project.",
  },
];

export function HomeGrowthFramework() {
  return (
    <section className="bg-ink-900 py-20 text-paper-100 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How We Work"
          title="How We Get You There"
          description="A clear, repeatable path from where your business is today to where it's ready to go. No guesswork, no wasted motion."
          tone="dark"
        />

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
        >
          {homeFrameworkStages.map((stage, index) => (
            <motion.li
              key={stage.number}
              variants={fadeUp}
              className="relative rounded-2xl border border-ink-700 bg-ink-800/60 p-6"
            >
              <span className="font-display text-3xl text-grove-400">{stage.number}</span>
              <h3 className="mt-4 text-display-md font-display font-semibold">{stage.title}</h3>
              <p className="mt-2 text-body text-paper-400">{stage.description}</p>
              {index < homeFrameworkStages.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-ink-600 lg:block"
                />
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>
  );
}
