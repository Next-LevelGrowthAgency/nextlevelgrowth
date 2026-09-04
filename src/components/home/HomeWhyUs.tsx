"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import type { Differentiator } from "@/types";

/**
 * Homepage-only "why us" card grid. /approach has its own distinct
 * 4-card version (src/components/approach/ApproachWhyUs.tsx) with
 * different copy — this component and its local homeDifferentiators
 * data are homepage-only, not shared with that page.
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
    title: "Mobile-First",
    description: "Built the way your customers actually browse.",
    icon: "Smartphone",
  },
  {
    title: "Honest Advice",
    description: "What your business needs, not what's easiest to sell.",
    icon: "BadgeCheck",
  },
  {
    title: "Long-Term Partnership",
    description: "Invested in where your business is headed, not just launch day.",
    icon: "Handshake",
  },
  {
    title: "Explained Clearly",
    description: "You'll understand exactly what we're doing and why.",
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
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {homeDifferentiators.map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-lifted">
              <Icon name={item.icon} className="h-5 w-5 text-blue-600" />
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
