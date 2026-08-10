"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { capabilityProofs } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

/**
 * Capability-based proof, not fabricated stats. Structure is intentionally
 * ready to swap in real, verified case-study metrics later — see
 * CONTENT-GUIDE.md for how to add a metric once results exist.
 */
export function ProofSection() {
  return (
    <section className="bg-ink-900 py-20 text-paper-100 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Built to Perform"
          title="Built to Actually Work for Your Business"
          description="We don't publish invented statistics. Here's what you actually get, starting on day one."
          tone="dark"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {capabilityProofs.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="rounded-2xl border border-ink-700 p-6">
              <Icon name={item.icon} className="h-5 w-5 text-grove-400" />
              <h3 className="mt-4 font-display text-display-md font-semibold">{item.title}</h3>
              <p className="mt-2 text-body text-paper-400">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
