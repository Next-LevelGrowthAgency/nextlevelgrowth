"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { differentiators } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

export function WhyUs() {
  return (
    <section className="bg-paper-200 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Next Level Growth"
          title="Growth Should Feel Clearer, Not More Complicated."
          description="Here's what makes working with us different from a typical agency engagement."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {differentiators.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="rounded-2xl bg-white p-6">
              <Icon name={item.icon} className="h-5 w-5 text-grove-600" />
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
