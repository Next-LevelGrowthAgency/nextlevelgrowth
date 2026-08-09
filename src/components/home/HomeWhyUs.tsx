"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import type { Differentiator } from "@/types";

/**
 * Homepage-only copy variant of WhyUs.tsx — see HomeGrowthFramework.tsx's
 * doc comment for why this split exists (WhyUs.tsx and the differentiators
 * data are also rendered on /approach, unchanged).
 */
const homeDifferentiators: Differentiator[] = [
  {
    title: "Strategy before design",
    description: "We start with your goals and your customers, not a template.",
    icon: "Compass",
  },
  {
    title: "Real results, not just good looks",
    description: "We build toward leads, calls, and appointments, not just good looks.",
    icon: "Target",
  },
  {
    title: "Clear communication",
    description: "You'll always know what's happening and why.",
    icon: "MessagesSquare",
  },
  {
    title: "Built around your business",
    description: "No unnecessary complexity, no generic playbooks.",
    icon: "Puzzle",
  },
  {
    title: "Fast, modern, and built for phones",
    description: "Built the way your customers actually browse.",
    icon: "Smartphone",
  },
  {
    title: "Honest recommendations",
    description: "We tell you what your business needs, not what's easiest for us to sell.",
    icon: "BadgeCheck",
  },
  {
    title: "A long-term partnership",
    description: "We're invested in where your business is headed, not just the launch date.",
    icon: "Handshake",
  },
  {
    title: "Plain answers, not tech talk",
    description: "You get plain-English guidance, not jargon.",
    icon: "Lightbulb",
  },
];

export function HomeWhyUs() {
  return (
    <section className="bg-paper-200 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Next Level Growth"
          title="Growth Should Feel Clearer, Not More Complicated."
          description="Here's what makes working with us different."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {homeDifferentiators.map((item) => (
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
