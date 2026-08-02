"use client";

import { coachIdentity } from "@/lib/growth-coach/config";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";

/**
 * Closed-state launcher. Circular icon-only touch target on mobile (68px —
 * ~20% larger than the previous 56px circle), expanding into a branded
 * pill with a visible "Growth Coach" label from `sm:` up so desktop
 * visitors never have to rely on a tooltip to know what this opens.
 */
export function GrowthCoachButton({ onClick }: { onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
      title={coachIdentity.fabTooltip}
      className="group flex h-[68px] w-[68px] items-center justify-center gap-3 rounded-full bg-grove-600 pl-0 pr-0 text-white shadow-lifted transition-all duration-200 ease-confident hover:bg-grove-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-700 motion-safe:active:scale-[0.97] sm:w-auto sm:justify-start sm:pl-3 sm:pr-6"
      aria-label={`Open ${coachIdentity.name}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
        <TrendingUp className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="hidden flex-col items-start leading-tight sm:flex">
        <span className="text-base font-semibold">{coachIdentity.fabLabel}</span>
        <span className="hidden text-[11px] font-normal text-white lg:block">{coachIdentity.fabSupportingLine}</span>
      </span>
    </motion.button>
  );
}
