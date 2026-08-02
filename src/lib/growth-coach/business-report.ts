import type { BusinessGrowthReport, CoachContext, GrowthScoreResult } from "@/types";
import { matchPlan } from "./packages";
import { recommendServices } from "./services";

function quote(text: string, max = 140) {
  const trimmed = text.trim();
  const clipped = trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
  return `"${clipped}"`;
}

export type BuildReportInput = {
  sourceFlow: "assessment" | "growth-plan" | "website-review";
  priorityKey: "website" | "leads" | "visibility";
  answers: string[];
  context: CoachContext;
};

const PRIORITY_FRAMING: Record<
  BuildReportInput["priorityKey"],
  { gap: string; rootCauses: string[]; strengths: string[]; quickWins: string[] }
> = {
  website: {
    gap: "the website isn't yet doing the job of turning attention into contact. It's the asset every other effort eventually sends people back to, so weaknesses there quietly cap everything else.",
    rootCauses: [
      "The site likely lacks one clear, unmissable next step above the fold on mobile.",
      "Messaging may describe services generally instead of the specific outcome customers want.",
      "Trust signals (reviews, credentials, proof) may not sit near the calls-to-action that need them.",
    ],
    strengths: ["There's already a foundation to sharpen rather than a blank page to fill, and that's a real head start."],
    quickWins: [
      "Confirm the phone number and one clear call-to-action are visible without scrolling on mobile.",
      "Rewrite the homepage headline around the specific outcome customers want.",
      "Add a trust signal (reviews, credentials, guarantee) near the main call-to-action.",
    ],
  },
  leads: {
    gap: "attention is arriving, but too much of it goes quiet after first contact instead of turning into a real conversation.",
    rootCauses: [
      "Response time after a new inquiry is likely inconsistent, which is the single biggest reason interested people go quiet.",
      "There may be no simple, repeatable way to see which inquiries have been followed up on.",
      "Follow-up may depend on memory rather than a standing process.",
    ],
    strengths: ["Customers are already reaching out. The top of the funnel is working; this is about what happens next."],
    quickWins: [
      "Set a one-hour response standard for every new inquiry, even a short holding reply.",
      "Create one saved response template so a fast reply doesn't depend on finding time to write one.",
      "Start a simple log so no inquiry silently falls through the cracks.",
    ],
  },
  visibility: {
    gap: "the business is workable but under-discovered. Customers actively searching for what it offers aren't finding it as easily as they could.",
    rootCauses: [
      "The Google Business Profile may be incomplete, inactive, or missing recent activity.",
      "Review volume or recency may be lower than what similar local businesses are showing.",
      "Content may not be structured around what customers actually search for.",
    ],
    strengths: ["The core offering appears solid. This is a visibility problem, not a product problem, which is a far easier one to fix."],
    quickWins: [
      "Fully complete the Google Business Profile: hours, categories, service area, recent photos.",
      "Ask the next five satisfied customers directly for a review, in the moment.",
      "Confirm business name, address, and phone number match exactly everywhere they're listed.",
    ],
  },
};

export function buildBusinessGrowthReport(input: BuildReportInput): BusinessGrowthReport {
  const { sourceFlow, priorityKey, answers, context } = input;
  const framing = PRIORITY_FRAMING[priorityKey];
  const foundation = answers[0] ?? context.business ?? "";
  const goal = context.primaryGoal ?? answers[answers.length - 1] ?? "";
  const hours = context.weeklyHours;
  const lean = hours !== null && hours <= 5;

  const recommendedServices = recommendServices({ sourceFlow, priorityKey, weeklyHours: hours });
  const recommendedPlan = matchPlan(recommendedServices);

  const topOpportunities = recommendedServices.map((s) => `${s.name}: ${s.relevance}`);

  const metrics = [...new Set(recommendedServices.map((s) => s.whatToMeasure))].slice(0, 4);

  const days1to30 = lean
    ? [framing.quickWins[0], "Protect one fixed weekly block to work on this before anything else competes for the time."]
    : [framing.quickWins[0], framing.quickWins[1], "Set up simple tracking so progress is visible, not assumed."];

  const days31to60 = lean
    ? ["Build one repeatable weekly habit around the top-priority action."]
    : [framing.quickWins[2], "Review early results and double down on whatever showed the clearest signal."];

  const days61to90 = lean
    ? ["Review results against the original goal and decide what earns more of the limited available time next."]
    : ["Address the next-highest-priority item from the opportunities above.", "Document the process so it doesn't depend entirely on the owner."];

  return {
    generatedAt: Date.now(),
    businessName: context.business,
    visitorName: null,
    executiveSummary: `${foundation ? quote(foundation) + ". " : ""}the most important move right now is ${framing.gap.replace(/^./, (c) => c.toLowerCase())} ${
      goal ? `Everything below is aimed at ${quote(goal)}.` : ""
    }`.trim(),
    currentState: foundation ? `Based on what was shared: ${quote(foundation)}` : "Current state wasn't fully captured in this conversation yet.",
    idealState: goal
      ? `A business where ${quote(goal)} is on a clear, trackable track rather than left to memory or hustle alone.`
      : "A business with a clear system behind its current momentum instead of relying on memory or hustle alone.",
    growthGap: framing.gap.charAt(0).toUpperCase() + framing.gap.slice(1),
    rootCauses: framing.rootCauses,
    strengths: framing.strengths,
    topOpportunities,
    quickWins: framing.quickWins.slice(0, lean ? 2 : 3),
    thirtyDayPlan: days1to30,
    ninetyDayRoadmap: { days1to30, days31to60, days61to90 },
    keyMetrics: metrics,
    risksAndConstraints: lean
      ? ["Limited weekly time is the main constraint. This plan intentionally does less, not more, to fit it."]
      : ["The main risk is losing focus mid-plan rather than any single tactic failing. Protecting the weekly review matters more than any one action."],
    recommendedServices,
    recommendedPlan,
    nextAction: recommendedServices[0]
      ? `${recommendedServices[0].name}: ${framing.quickWins[0]}`
      : "Have a short conversation with Next Level Growth to identify the right starting point.",
  };
}

/**
 * Builds the full Business Growth Report from a Growth Score result
 * (Full Assessment completion) rather than from one of the three original
 * scripted flows — a second, parallel entry point into the same report
 * shape so nothing about the existing flow-based builder above changes.
 */
export function buildBusinessGrowthReportFromScore(score: GrowthScoreResult, context: CoachContext): BusinessGrowthReport {
  const weakest = score.categoryResults.find((r) => r.categoryId === score.weakestCategory);
  const strongest = score.categoryResults.find((r) => r.categoryId === score.strongestCategory);

  const executiveSummary =
    score.overallScore !== null
      ? `Your Next Level Growth Score is ${score.overallScore}/100 (${score.scoreBand?.label}). ${score.scoreBand?.message}`
      : `There isn't yet enough information for a full score, but early signals point toward ${score.highestPriorityGap ?? "a few clear opportunities"}.`;

  return {
    generatedAt: Date.now(),
    businessName: context.business,
    visitorName: null,
    executiveSummary,
    currentState: strongest ? `${strongest.label} is the strongest area right now, based on what was shared.` : "The current state is still emerging from the assessment.",
    idealState: "A business where every category above sits in the 'Strong Growth Foundation' range or higher, held together by systems rather than memory.",
    growthGap: weakest ? `${weakest.label} is the biggest gap holding overall growth back right now.` : "The biggest gap isn't yet clear from the information gathered.",
    rootCauses: score.topWeaknesses.map((w) => w.rootCause),
    strengths: score.topStrengths.map((s) => s.what),
    topOpportunities: score.topWeaknesses.map((w) => `${w.what}: ${w.countermeasure}`),
    quickWins: score.quickWins,
    thirtyDayPlan: score.thirtyDayPlan,
    ninetyDayRoadmap: { days1to30: score.thirtyDayPlan, days31to60: score.doLater.slice(0, 2), days61to90: score.ninetyDayPlan },
    keyMetrics: score.metricsToTrack,
    risksAndConstraints:
      score.categoriesMissing.length > 0
        ? [`Not yet assessed: ${score.infoMissing.join(", ")}. Treat conclusions there as preliminary.`]
        : ["No major constraints identified from the assessment beyond what's listed above."],
    recommendedServices: score.recommendedServices,
    recommendedPlan: score.recommendedPlan ?? {
      planId: "custom-partnership",
      name: "Custom Partnership",
      reason: "Not enough information yet to confidently match a standard plan.",
      included: ["A conversation to understand the specific situation"],
      notIncluded: ["N/A, scoped individually"],
      nextStep: "Book a strategy conversation",
    },
    nextAction: score.immediateNextAction,
    growthScore: score,
  };
}
