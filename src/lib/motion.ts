import type { Variants } from "framer-motion";

/**
 * Shared, restrained motion vocabulary for the whole site.
 * Framer Motion already respects `prefers-reduced-motion` when a component
 * checks `useReducedMotion()`, but these variants are also deliberately
 * subtle (short distance, no bounce) so motion never fights readability.
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export const staggerChildren = (stagger = 0.12): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  },
});

export const viewportOnce = { once: true, margin: "-80px" as const };
