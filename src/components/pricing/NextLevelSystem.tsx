"use client";

import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import {
  Brain,
  Crown,
  FileText,
  Gauge,
  LayoutTemplate,
  MapPin,
  Search,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";

const nodes: { label: string; icon: LucideIcon }[] = [
  { label: "Website", icon: LayoutTemplate },
  { label: "Google", icon: MapPin },
  { label: "SEO", icon: Search },
  { label: "Reviews", icon: Star },
  { label: "AI", icon: Brain },
  { label: "Automation", icon: Settings },
  { label: "Content", icon: FileText },
  { label: "Optimization", icon: Gauge },
];

const supportingLabels = ["Advanced SEO", "AI Assistant", "Content", "Reputation", "Conversion", "Priority"];

/** Native "integrated growth system" visual for the Next Level package — a hub of connected capabilities, not a technical diagram. */
export function NextLevelSystem() {
  return (
    <div className="mt-10 border-t border-indigo-100 pt-8">
      <p className="text-center text-eyebrow text-indigo-700">Your Growth System</p>

      <div className="mt-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-700 to-purple-900 text-white shadow-lifted"
        >
          <Crown className="h-6 w-6" aria-hidden="true" />
        </motion.div>
        <span aria-hidden="true" className="my-2 h-5 w-px bg-gradient-to-b from-indigo-300 to-transparent" />

        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.06)}
          className="grid grid-cols-4 gap-2.5 sm:gap-3"
        >
          {nodes.map((node) => (
            <motion.li
              key={node.label}
              variants={fadeUp}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-indigo-100 bg-white px-3 py-3 text-center shadow-soft"
            >
              <node.icon className="h-4 w-4 text-indigo-700" aria-hidden="true" />
              <span className="text-[11px] font-medium leading-tight text-ink-700">{node.label}</span>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {supportingLabels.map((label) => (
            <span key={label} className="rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 text-xs font-medium text-indigo-700">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
