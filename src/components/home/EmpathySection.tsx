"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { Compass, Inbox, LayoutTemplate, Search, type LucideIcon } from "lucide-react";

const problems: { label: string; headline: string; supporting: string; icon: LucideIcon; gradient: string }[] = [
  {
    label: "Website",
    headline: "Your website feels outdated.",
    supporting: "Or you don't have one yet.",
    icon: LayoutTemplate,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    label: "Visibility",
    headline: "Customers can't easily find you.",
    supporting: "Your business isn't showing up where it should.",
    icon: Search,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    label: "Opportunities",
    headline: "Potential customers slip away.",
    supporting: "Calls, forms, and follow-up aren't connected.",
    icon: Inbox,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    label: "Direction",
    headline: "You're not sure what comes next.",
    supporting: "Too many tools. No clear plan.",
    icon: Compass,
    gradient: "from-violet-600 to-purple-700",
  },
];

export function EmpathySection() {
  return (
    <section className="bg-paper-100 py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Your Business Deserves a Strong Online Presence"
          title="You&rsquo;ve Built the Business. Let&rsquo;s Make Sure People See It."
          description="A great business can still be overlooked when its website, search presence, and customer experience don't reflect the quality behind it."
        />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {problems.map((item) => (
            <motion.li
              key={item.label}
              variants={fadeUp}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${item.gradient}`}>
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-eyebrow text-ink-500">{item.label}</p>
              <p className="mt-1.5 font-display text-base font-semibold leading-snug text-ink-900">{item.headline}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{item.supporting}</p>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}
