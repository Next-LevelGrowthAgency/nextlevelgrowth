"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { Compass, Inbox, LayoutTemplate, Search, type LucideIcon } from "lucide-react";

const frustrations: { label: string; statement: string; icon: LucideIcon; gradient: string }[] = [
  {
    label: "Website",
    statement: "Outdated or nonexistent online presence.",
    icon: LayoutTemplate,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    label: "Visibility",
    statement: "Hard to get found by the right customers.",
    icon: Search,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    label: "Leads",
    statement: "Inconsistent inquiries and missed opportunities.",
    icon: Inbox,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    label: "Direction",
    statement: "Disconnected tools and unclear next steps.",
    icon: Compass,
    gradient: "from-violet-600 to-purple-700",
  },
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
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {frustrations.map((item) => (
            <motion.li
              key={item.label}
              variants={fadeUp}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${item.gradient}`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-eyebrow text-ink-500">{item.label}</p>
              <p className="mt-1.5 font-display text-base font-semibold leading-snug text-ink-900">{item.statement}</p>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
