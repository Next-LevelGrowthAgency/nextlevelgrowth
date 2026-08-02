import type { PlanId, PlanRecommendation, ServiceRecommendation } from "@/types";

/**
 * CENTRALIZED PACKAGE CONFIGURATION
 * ------------------------------------------------------------------
 * The only place plan names, descriptions, and features should live.
 * Pricing is intentionally absent — no approved public pricing exists
 * yet (confirmed nowhere else in the codebase either), so every plan is
 * marked "to be finalized" rather than showing a fabricated number.
 * Edit this file to change what's offered; nothing else should need to
 * change to reflect it.
 */

export type PackageDefinition = {
  id: PlanId;
  internalName: string;
  publicName: string;
  description: string;
  idealFor: string;
  included: string[];
  notIncluded: string[];
  displayOrder: number;
  ctaLabel: string;
  pricing: { status: "to-be-finalized" };
  availability: "available" | "waitlist";
};

export const PACKAGE_CATALOG: Record<PlanId, PackageDefinition> = {
  foundation: {
    id: "foundation",
    internalName: "Foundation",
    publicName: "Foundation",
    description: "A focused fix for the single highest-priority gap, sized for limited time or budget.",
    idealFor: "Early-stage or resource-constrained businesses that need one thing done well before anything else.",
    included: ["The single top-priority service", "A clear 30-day action plan", "One progress check-in"],
    notIncluded: ["Multi-channel campaigns", "Dedicated automation build-out", "Ongoing monthly management"],
    displayOrder: 1,
    ctaLabel: "Start with the Foundation plan",
    pricing: { status: "to-be-finalized" },
    availability: "available",
  },
  growth: {
    id: "growth",
    internalName: "Growth",
    publicName: "Growth",
    description: "Two to three coordinated services for a business ready to invest in several areas at once.",
    idealFor: "Established businesses with more than one real gap and the capacity to act on a broader plan.",
    included: ["The recommended service bundle", "A 90-day roadmap", "Monthly progress reviews"],
    notIncluded: ["Full dedicated automation build-out", "Unlimited revision cycles"],
    displayOrder: 2,
    ctaLabel: "Explore the Growth plan",
    pricing: { status: "to-be-finalized" },
    availability: "available",
  },
  scale: {
    id: "scale",
    internalName: "Scale",
    publicName: "Scale",
    description: "Comprehensive, coordinated work across website, visibility, and systems for businesses ready to grow on multiple fronts.",
    idealFor: "Businesses with several interconnected gaps, or that came through a full assessment revealing broad opportunity.",
    included: ["The full recommended service set", "Systems and automation planning", "Ongoing coordinated execution"],
    notIncluded: ["Anything outside the agreed scope without a separate conversation"],
    displayOrder: 3,
    ctaLabel: "Discuss the Scale plan",
    pricing: { status: "to-be-finalized" },
    availability: "available",
  },
  "custom-partnership": {
    id: "custom-partnership",
    internalName: "Custom Partnership",
    publicName: "Custom Partnership",
    description: "A plan scoped specifically around a situation that doesn't fit a standard tier.",
    idealFor: "Anyone whose need is highly specific, still unclear, or spans well beyond a single standard plan.",
    included: ["A conversation to understand the specific situation", "A proposal scoped to what's actually needed"],
    notIncluded: ["N/A, everything here is scoped individually"],
    displayOrder: 4,
    ctaLabel: "Book a strategy conversation",
    pricing: { status: "to-be-finalized" },
    availability: "available",
  },
};

/**
 * Matches a plan from the number and nature of recommended services —
 * never defaults to the highest tier, and falls back to Custom
 * Partnership rather than guessing when nothing clearly fits.
 */
export function matchPlan(recommendedServices: ServiceRecommendation[]): PlanRecommendation {
  const count = recommendedServices.length;
  const names = recommendedServices.map((s) => s.name).join(", ");

  const plan = count === 0 ? PACKAGE_CATALOG["custom-partnership"] : count <= 1 ? PACKAGE_CATALOG.foundation : count <= 3 ? PACKAGE_CATALOG.growth : PACKAGE_CATALOG.scale;

  const reason =
    count === 0
      ? "Nothing about this situation clearly matched a standard plan yet. A short conversation is the most honest next step."
      : `Based on the ${count} area${count === 1 ? "" : "s"} identified (${names}), the ${plan.publicName} plan matches the actual scope of what would move things forward: not more, not less.`;

  return {
    planId: plan.id,
    name: plan.publicName,
    reason,
    included: plan.included,
    notIncluded: plan.notIncluded,
    nextStep: plan.ctaLabel,
  };
}
