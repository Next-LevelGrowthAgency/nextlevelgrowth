"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const before = [
  "Hard to find",
  "Difficult to trust",
  "Inconsistent inquiries",
  "Disconnected marketing",
  "Unclear next steps",
];

const after = [
  "Strong online credibility",
  "Easier discovery",
  "Better lead capture",
  "Clearer messaging",
  "A unified growth strategy",
  "Confidence about what comes next",
];

export function TransformationSection() {
  return (
    <section className="bg-paper-200 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Shift"
          title="From Overlooked Online to Impossible to Miss"
          description="A clear before-and-after view of what changes when your digital presence finally matches the quality of your business."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            className="rounded-3xl border border-ink-200 bg-white p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Before</p>
            <ul className="mt-5 space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-center gap-3 text-ink-600">
                  <Icon name="Minus" className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-grove-200 bg-grove-50 p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-grove-700">After</p>
            <ul className="mt-5 space-y-4">
              {after.map((item) => (
                <li key={item} className="flex items-center gap-3 text-ink-800">
                  <Icon name="Check" className="h-4 w-4 shrink-0 text-grove-600" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
