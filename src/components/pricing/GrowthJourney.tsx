"use client";

import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { BarChart3, PhoneCall, Search, Star } from "lucide-react";

const steps = [
  { number: "01", title: "Get Found", detail: "Google + SEO", icon: Search },
  { number: "02", title: "Build Trust", detail: "Website + Reviews", icon: Star },
  { number: "03", title: "Capture", detail: "Calls + Forms", icon: PhoneCall },
  { number: "04", title: "Improve", detail: "Tracking + Optimization", icon: BarChart3 },
];

/** Native four-step growth loop visual, shown beneath the Growth package's main content. */
export function GrowthJourney() {
  return (
    <div className="mt-10 border-t border-blue-100 pt-8">
      <p className="text-center text-eyebrow text-blue-600">The Growth Loop</p>

      <motion.ol
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerChildren(0.1)}
        className="relative mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {steps.map((step, index) => (
          <motion.li key={step.number} variants={fadeUp} className="relative flex flex-col items-center rounded-xl border border-blue-100 bg-white p-4 text-center shadow-soft">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white">
              <step.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <h4 className="mt-2.5 font-display text-sm font-semibold text-ink-900">{step.title}</h4>
            <p className="mt-0.5 text-xs text-ink-500">{step.detail}</p>

            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-gradient-to-r from-blue-300 to-violet-300 lg:block" />
            ) : null}
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}
