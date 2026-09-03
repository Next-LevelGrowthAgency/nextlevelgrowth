"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { MapPinned, Target, Compass as CompassIcon } from "lucide-react";

const principles = [
  { label: "Your Business", question: "Where are you today?", icon: CompassIcon, gradient: "from-teal-500 to-cyan-500" },
  { label: "Your Goals", question: "Where do you want to go?", icon: Target, gradient: "from-cyan-500 to-blue-600" },
  { label: "The Right Plan", question: "What gets you there?", icon: MapPinned, gradient: "from-blue-600 to-purple-600" },
];

/**
 * Sits directly under the hero. The soft top fade (dark → paper-100)
 * keeps the transition from the cinematic hero from feeling like an
 * abrupt cut to a plain white section.
 */
export function ApproachIntro() {
  return (
    <section className="relative overflow-hidden bg-paper-100 py-16 sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink-900 to-transparent" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.1)}
          className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16"
        >
          <motion.div variants={fadeUp}>
            <p className="text-eyebrow mb-3 text-gradient-brand">Start With Understanding</p>
            <h2 className="balance text-display-lg text-ink-900">Your Business Comes First</h2>
            <p className="mt-5 max-w-lg text-body text-ink-600">
              Before we recommend a website, SEO strategy, AI tool, automation, or anything else, we
              first understand your business, your customers, and what you&rsquo;re trying to
              accomplish.
            </p>
            <p className="mt-4 max-w-lg text-body text-ink-600">
              The goal isn&rsquo;t to add more technology. It&rsquo;s to build the right combination of
              tools and strategy to help your business move forward.
            </p>
          </motion.div>

          <motion.ol variants={fadeUp} className="space-y-3">
            {principles.map((item) => (
              <li key={item.label} className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white ${item.gradient}`}>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-eyebrow text-ink-500">{item.label}</p>
                  <p className="mt-0.5 font-display text-base font-semibold text-ink-900">{item.question}</p>
                </div>
              </li>
            ))}
          </motion.ol>
        </motion.div>
      </Container>
    </section>
  );
}
