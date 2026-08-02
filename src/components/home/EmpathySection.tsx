"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

const frustrations = [
  { icon: "GlobeLock", text: "An outdated or nonexistent website" },
  { icon: "TrendingDown", text: "Inconsistent leads" },
  { icon: "SearchX", text: "Poor visibility on Google" },
  { icon: "HelpCircle", text: "Confusing marketing advice" },
  { icon: "MailQuestion", text: "Missed inquiries" },
  { icon: "Blocks", text: "Too many disconnected tools" },
  { icon: "MegaphoneOff", text: "Agencies that overpromise and undercommunicate" },
  { icon: "SignpostBig", text: "Uncertainty about what to do next" },
];

export function EmpathySection() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="We Get It"
          title="Running a Great Business Is Hard Enough. Growing Online Shouldn&rsquo;t Feel This Complicated."
          description="Most business owners aren't struggling because they lack ambition. They're struggling because digital marketing has been made more confusing than it needs to be."
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {frustrations.map((item) => (
            <motion.li
              key={item.text}
              variants={fadeUp}
              className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5"
            >
              <Icon name={item.icon} className="mt-0.5 h-5 w-5 shrink-0 text-ink-500" />
              <span className="text-sm leading-relaxed text-ink-700">{item.text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
