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
    title: "Strategy First",
    description: "We start with your goals and your customers, not a template.",
    icon: "Compass",
  },
  {
    title: "Real Results",
    description: "We build toward leads, calls, and booked appointments.",
    icon: "Target",
  },
  {
    title: "Clear Communication",
    description: "You'll always know what's happening and why.",
    icon: "MessagesSquare",
  },
  {
    title: "Built Around Your Business",
    description: "No unnecessary complexity, no generic playbooks.",
    icon: "Puzzle",
  },
  {
    title: "Fast & Mobile-First",
    description: "Built the way your customers actually browse.",
    icon: "Smartphone",
  },
  {
    title: "Honest Recommendations",
    description: "What your business needs, not what's easiest to sell.",
    icon: "BadgeCheck",
  },
  {
    title: "Long-Term Partnership",
    description: "Invested in where your business is headed, not just launch day.",
    icon: "Handshake",
  },
  {
    title: "Plain-English Guidance",
    description: "Clear explanations, never tech jargon.",
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
            <motion.div key={item.title} variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-lifted">
              <Icon name={item.icon} className="h-5 w-5 text-blue-600" />
              <h3 className="mt-4 font-display text-display-md font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-body text-ink-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
