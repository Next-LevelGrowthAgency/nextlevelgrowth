"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Compass, Hammer, Map, Rocket, TrendingUp, type LucideIcon } from "lucide-react";

const steps: { number: string; label: string; heading: string; copy: string; icon: LucideIcon; gradient: string }[] = [
  {
    number: "01",
    label: "Understand",
    heading: "Understand Your Business",
    copy: "We start with your goals, your customers, and where you feel stuck.",
    icon: Compass,
    gradient: "from-teal-500 to-teal-600",
  },
  {
    number: "02",
    label: "Plan",
    heading: "Build the Right Plan",
    copy: "We find the highest-impact opportunities and build a clear plan.",
    icon: Map,
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    number: "03",
    label: "Build",
    heading: "Bring It to Life",
    copy: "We build the website, systems, or tools your plan actually needs.",
    icon: Hammer,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    number: "04",
    label: "Launch",
    heading: "Put It to Work",
    copy: "We launch, connect, and test everything so it works together.",
    icon: Rocket,
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    number: "05",
    label: "Grow",
    heading: "Keep Moving Forward",
    copy: "We review results and keep improving as your business grows.",
    icon: TrendingUp,
    gradient: "from-purple-500 to-purple-600",
  },
];

export function ApproachProcess() {
  return (
    <section id="how-we-move-forward" className="scroll-mt-24 bg-paper-200 py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-3 text-gradient-brand">How We Move Forward</p>
          <h2 className="balance text-display-lg text-ink-900">From Where You Are to What Comes Next</h2>
        </div>

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.1)}
          className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-6 xl:grid-cols-5"
        >
          {/* Continuous mobile timeline spine — sits behind the icon circles (which are z-10 with a white backing) so it reads as one unbroken path, not five disconnected segments. */}
          <span aria-hidden="true" className="absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-teal-300 via-blue-300 to-purple-400 sm:hidden" />

          {steps.map((step, index) => (
            <motion.li key={step.number} variants={fadeUp} className="relative pl-16 sm:pl-0 sm:text-center">
              <div className={cn("absolute left-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-soft sm:static sm:mx-auto", step.gradient)}>
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="font-display text-xs font-semibold uppercase tracking-wide text-ink-400 sm:mt-3">
                Step {step.number}
              </p>
              <h3 className="mt-1 font-display text-base font-semibold leading-snug text-ink-900">{step.heading}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.copy}</p>

              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-[22px] hidden h-px w-6 bg-gradient-to-r from-ink-300 to-ink-200 xl:block"
                />
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </section>
  );
}
