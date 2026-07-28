"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { frameworkStages } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

export function GrowthFramework() {
  return (
    <section className="bg-ink-900 py-20 text-paper-100 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our Methodology"
          title="The Next Level Growth Framework"
          description="A clear, repeatable path from where your business is today to where it's ready to go — no guesswork, no wasted motion."
          tone="dark"
        />

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
        >
          {frameworkStages.map((stage, index) => (
            <motion.li
              key={stage.number}
              variants={fadeUp}
              className="relative rounded-2xl border border-ink-700 bg-ink-800/60 p-6"
            >
              <span className="font-display text-3xl text-grove-400">{stage.number}</span>
              <h3 className="mt-4 text-lg font-display font-semibold">{stage.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-400">{stage.description}</p>
              {index < frameworkStages.length - 1 ? (
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
