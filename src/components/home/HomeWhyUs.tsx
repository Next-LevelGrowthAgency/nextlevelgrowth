"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import type { Differentiator } from "@/types";

/**
 * Homepage-only "why us" card grid. Six principles, not eight — the
 * eight-card version was consistently the site's biggest source of card
 * overflow (see git history), and six lets each card breathe at a
 * 3-column desktop grid without the aggressive sizing/breakpoint
 * workarounds the eight-card version needed.
 */
const homeDifferentiators: Differentiator[] = [
  {
    title: "Strategy First",
    description: "We start with your business and your goals, not a template.",
    icon: "Compass",
  },
  {
    title: "Built Around You",
    description: "Solutions should fit your business, not the other way around.",
    icon: "Puzzle",
  },
  {
    title: "Clear Communication",
    description: "You'll know what we're building, why it matters, and what's next.",
    icon: "MessagesSquare",
  },
  {
    title: "Modern By Design",
    description: "Fast, responsive experiences built for how customers browse today.",
    icon: "Smartphone",
  },
  {
    title: "Honest Advice",
    description: "We build what makes sense and skip what doesn't.",
    icon: "BadgeCheck",
  },
  {
    title: "Long-Term Thinking",
    description: "A foundation built to grow with your business.",
    icon: "Handshake",
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
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
