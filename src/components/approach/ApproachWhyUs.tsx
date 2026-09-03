"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { Handshake, MessageCircle, Target, Wrench, type LucideIcon } from "lucide-react";

const reasons: { title: string; copy: string; icon: LucideIcon; gradient: string }[] = [
  {
    title: "Start With Your Goals",
    copy: "We begin with what you want to accomplish, not with a prebuilt package or template.",
    icon: Target,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    title: "Build With Purpose",
    copy: "Every website, system, and strategy should have a clear reason for being there.",
    icon: Wrench,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    title: "Keep It Clear",
    copy: "You’ll know what we’re working on, why it matters, and what comes next.",
    icon: MessageCircle,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    title: "Grow Together",
    copy: "We’re here to build something useful today and help it evolve as your business grows.",
    icon: Handshake,
    gradient: "from-violet-600 to-purple-700",
  },
];

export function ApproachWhyUs() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-3 text-gradient-brand">Why Next Level Growth</p>
          <h2 className="balance text-display-lg text-ink-900">Built Around What Your Business Needs</h2>
          <p className="mt-4 text-subhead text-ink-600">
            The right solution looks different for every business. That&rsquo;s why we start with
            your goals and build from there.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${reason.gradient}`}>
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold leading-snug text-ink-900">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{reason.copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
