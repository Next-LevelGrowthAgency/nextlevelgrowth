import type {
  ConfidenceLabel,
  GrowthCategoryResult,
  GrowthScoreAnswer,
  GrowthScoreCategoryConfig,
  GrowthScoreQuestion,
  GrowthScoreResult,
  GrowthStrength,
  GrowthWeakness,
  ScoreAnswerValue,
  ServiceRecommendation,
} from "@/types";
import { matchPlan } from "../packages";
import { buildServiceRecommendation } from "../services";
import { CONFIDENCE_THRESHOLDS, GROWTH_SCORE_CATEGORIES, SCORE_BANDS } from "./config";

/**
 * NEXT LEVEL GROWTH SCORE — DETERMINISTIC SCORING ENGINE
 * ------------------------------------------------------------------
 * Pure functions only — no randomness, no hidden state. Every number
 * traces back to config.ts (categories/weights/questions/thresholds) and
 * the specific answers recorded this session. Identical answers always
 * produce identical results; changing a configured weight predictably
 * shifts the result. This file contains zero scoring *content* — only
 * the math and aggregation rules.
 */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function labelConfidence(score: number): ConfidenceLabel {
  if (score < CONFIDENCE_THRESHOLDS.low) return "insufficient";
  if (score < CONFIDENCE_THRESHOLDS.moderate) return "low";
  if (score < CONFIDENCE_THRESHOLDS.high) return "moderate";
  return "high";
}

export function getEnabledCategories(): GrowthScoreCategoryConfig[] {
  return GROWTH_SCORE_CATEGORIES.filter((category) => category.enabled).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getQuestionById(id: string): GrowthScoreQuestion | undefined {
  for (const category of GROWTH_SCORE_CATEGORIES) {
    const question = category.questions.find((q) => q.id === id);
    if (question) return question;
  }
  return undefined;
}

export function buildQuestionQueue(mode: "quick" | "full"): string[] {
  const ids: string[] = [];
  for (const category of getEnabledCategories()) {
    for (const question of category.questions) {
      if (mode === "quick" && !question.quickCheck) continue;
      ids.push(question.id);
    }
  }
  return ids;
}

/** Turns a chosen option value into a recorded, points-resolved answer. "Unknown"/"not-applicable" never carry points. */
export function recordAnswer(question: GrowthScoreQuestion, value: ScoreAnswerValue): GrowthScoreAnswer {
  const option = value === "unknown" || value === "not-applicable" ? undefined : question.options.find((o) => o.value === value);
  return {
    questionId: question.id,
    categoryId: question.categoryId,
    value,
    points: option ? option.points : null,
    answeredAt: Date.now(),
  };
}

/**
 * One concrete contradiction check, proving the mechanism rather than
 * claiming exhaustive contradiction detection: claiming no website while
 * also answering a question specifically about that website's
 * call-to-action.
 */
function detectContradictions(answers: GrowthScoreAnswer[]): string[] {
  const contradictions: string[] = [];
  const noWebsite = answers.find((a) => a.questionId === "website-working" && a.value === "no-website");
  const ctaAnswer = answers.find((a) => a.questionId === "website-clear-cta");
  if (noWebsite && ctaAnswer && ctaAnswer.value !== "unknown" && ctaAnswer.value !== "not-applicable") {
    contradictions.push(
      "You mentioned not having a website, but also answered a question about your website's call-to-action. Worth double-checking which is accurate."
    );
  }
  return contradictions;
}

function scoreCategory(category: GrowthScoreCategoryConfig, answers: GrowthScoreAnswer[]): GrowthCategoryResult {
  const categoryAnswers = answers.filter((a) => a.categoryId === category.id);
  let rawScore = 0;
  let maximumScore = 0;
  let questionsAnswered = 0;
  let questionsSkipped = 0;
  let questionsUnknown = 0;
  const supportingEvidence: string[] = [];

  for (const question of category.questions) {
    const answer = categoryAnswers.find((a) => a.questionId === question.id);
    if (!answer) continue;

    if (answer.value === "not-applicable") {
      questionsSkipped += 1;
      continue;
    }
    if (answer.value === "unknown") {
      questionsUnknown += 1;
      continue;
    }

    questionsAnswered += 1;
    rawScore += (answer.points ?? 0) * question.weight;
    maximumScore += question.maxPoints * question.weight;
    const option = question.options.find((o) => o.value === answer.value);
    supportingEvidence.push(`${question.prompt} → ${option?.label ?? answer.value}`);
  }

  const normalizedScore = maximumScore > 0 ? clamp((rawScore / maximumScore) * 100, 0, 100) : 0;
  const totalQuestions = category.questions.length;
  const considered = questionsAnswered + questionsSkipped + questionsUnknown;
  const coverage = totalQuestions > 0 ? considered / totalQuestions : 0;
  const knownRatio = totalQuestions > 0 ? questionsAnswered / totalQuestions : 0;
  const confidenceScore = clamp(coverage * 0.4 + knownRatio * 0.6, 0, 1);
  const confidenceLabel = labelConfidence(confidenceScore);

  const positiveIndicators = questionsAnswered > 0 && normalizedScore >= category.thresholds.strong ? [...category.positiveIndicatorHints] : [];
  const riskIndicators = questionsAnswered > 0 && normalizedScore <= category.thresholds.weak ? [...category.riskIndicatorHints] : [];

  const strengths: GrowthStrength[] = [];
  const weaknesses: GrowthWeakness[] = [];
  const growthGaps: string[] = [];
  const recommendedActions: string[] = [];
  const relatedServices: GrowthCategoryResult["relatedServices"] = [];

  if (questionsAnswered > 0 && normalizedScore >= category.thresholds.strong) {
    strengths.push({
      categoryId: category.id,
      what: category.positiveIndicatorHints[0] ?? `${category.label} is a strength`,
      evidence: supportingEvidence.join("; "),
      whyItMatters: category.description,
      howToLeverage: "Keep this consistent. It compounds over time rather than being a one-time win.",
      scalable: category.id !== "founder-sustainability",
      ownerDependent: category.id === "systems-operations" || category.id === "leadership-team",
    });
  } else if (questionsAnswered > 0 && normalizedScore <= category.thresholds.weak) {
    const countermeasure = category.recommendedActionsByWeakness[0] ?? "Revisit this area with a focused, small next step.";
    weaknesses.push({
      categoryId: category.id,
      what: category.riskIndicatorHints[0] ?? `${category.label} needs attention`,
      evidence: supportingEvidence.join("; "),
      severity: normalizedScore <= category.thresholds.weak / 2 ? "high" : "moderate",
      businessImpact: category.description,
      rootCause: "Inferred from the pattern of answers in this category. Treat as a starting hypothesis, not a diagnosis.",
      countermeasure,
      metricToTrack: `Progress after: ${countermeasure}`,
      priority: "do-next",
      relatedServiceId: category.relatedServiceIds[0],
    });
    growthGaps.push(category.riskIndicatorHints[0] ?? category.description);
    recommendedActions.push(...category.recommendedActionsByWeakness.slice(0, 2));
    relatedServices.push(...category.relatedServiceIds);
  }

  return {
    categoryId: category.id,
    label: category.label,
    rawScore,
    weightedScore: normalizedScore * category.weight,
    maximumScore,
    normalizedScore,
    confidenceScore,
    confidenceLabel,
    questionsAnswered,
    questionsSkipped,
    questionsUnknown,
    supportingEvidence,
    positiveIndicators,
    riskIndicators,
    strengths,
    weaknesses,
    growthGaps,
    recommendedActions,
    relatedServices,
  };
}

type PriorityBuckets = { doNow: GrowthWeakness[]; doNext: GrowthWeakness[]; doLater: GrowthWeakness[]; notYet: GrowthWeakness[] };

/**
 * Ranks weaknesses by (impact × category weight) ÷ effort, then buckets
 * by RANK — never more than one Do Now item — so the result can't push
 * the user to fix everything simultaneously. This is a transparent
 * formula, not a fabricated multi-factor optimizer.
 */
function prioritizeWeaknesses(weaknesses: GrowthWeakness[], categoryResults: GrowthCategoryResult[]): PriorityBuckets {
  const scored = weaknesses
    .map((weakness) => {
      const category = GROWTH_SCORE_CATEGORIES.find((c) => c.id === weakness.categoryId);
      const result = categoryResults.find((r) => r.categoryId === weakness.categoryId);
      if (!category || !result) return { weakness, priorityScore: 0 };
      const priorityScore = ((100 - result.normalizedScore) * category.weight) / category.effortProxy;
      return { weakness, priorityScore };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const buckets: PriorityBuckets = { doNow: [], doNext: [], doLater: [], notYet: [] };
  scored.forEach(({ weakness }, index) => {
    if (index === 0) {
      weakness.priority = "do-now";
      buckets.doNow.push(weakness);
    } else if (index <= 2) {
      weakness.priority = "do-next";
      buckets.doNext.push(weakness);
    } else if (index <= 4) {
      weakness.priority = "do-later";
      buckets.doLater.push(weakness);
    } else {
      weakness.priority = "not-yet";
      buckets.notYet.push(weakness);
    }
  });
  return buckets;
}

function buildServiceRecommendationsFromWeaknesses(weaknesses: GrowthWeakness[]): ServiceRecommendation[] {
  const seen = new Set<string>();
  const out: ServiceRecommendation[] = [];
  for (const weakness of weaknesses) {
    if (!weakness.relatedServiceId || seen.has(weakness.relatedServiceId)) continue;
    seen.add(weakness.relatedServiceId);
    out.push(
      buildServiceRecommendation(
        weakness.relatedServiceId,
        weakness.countermeasure,
        weakness.priority === "do-now" ? "do-now" : weakness.priority === "do-next" ? "do-next" : "do-later"
      )
    );
    if (out.length >= 4) break;
  }
  return out;
}

function confidenceExplanation(label: ConfidenceLabel, coverage: number, categoryCoverage: number, contradictions: string[]): string {
  const coveragePct = Math.round(coverage * 100);
  const categoryPct = Math.round(categoryCoverage * 100);
  const base = `Based on ${coveragePct}% of all Growth Score questions and ${categoryPct}% of categories evaluated.`;
  const contradictionNote = contradictions.length > 0 ? " A possible contradiction in your answers also reduced confidence slightly." : "";
  if (label === "insufficient") return `${base} That's not yet enough to calculate a reliable score.${contradictionNote}`;
  if (label === "low") return `${base} Enough for an early read, but more answers would sharpen it.${contradictionNote}`;
  if (label === "moderate") return `${base} A reasonably solid picture, with room to get more precise.${contradictionNote}`;
  return `${base} A well-supported picture across most of the business.${contradictionNote}`;
}

export function calculateGrowthScore(mode: "quick" | "full", answers: GrowthScoreAnswer[]): GrowthScoreResult {
  const categories = getEnabledCategories();
  const categoryResults = categories.map((category) => scoreCategory(category, answers));

  const evaluated = categoryResults.filter((r) => r.questionsAnswered + r.questionsSkipped + r.questionsUnknown > 0);
  const missing = categoryResults.filter((r) => !evaluated.includes(r));
  const scorable = evaluated.filter((r) => r.questionsAnswered > 0);

  const weightOf = (id: string) => categories.find((c) => c.id === id)?.weight ?? 0;
  const totalWeight = scorable.reduce((sum, r) => sum + weightOf(r.categoryId), 0);
  const overallRaw = totalWeight > 0 ? scorable.reduce((sum, r) => sum + r.normalizedScore * weightOf(r.categoryId), 0) / totalWeight : null;

  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);
  const consideredQuestions = answers.length;
  const knownAnswers = answers.filter((a) => a.value !== "unknown").length;
  const coverage = totalQuestions > 0 ? consideredQuestions / totalQuestions : 0;
  const knownRatio = consideredQuestions > 0 ? knownAnswers / consideredQuestions : 0;
  const categoryCoverage = categories.length > 0 ? scorable.length / categories.length : 0;
  const contradictions = detectContradictions(answers);
  const contradictionPenalty = contradictions.length > 0 ? 0.15 : 0;
  // How much of the whole assessment was actually covered — this is the
  // primary driver. A handful of answered questions (even if every one of
  // them is "known") must NOT be enough to claim high confidence; how much
  // is unknown then discounts that coverage rather than adding its own
  // independent credit, so a few known answers alone can never manufacture
  // confidence the coverage doesn't support.
  const coverageConfidence = coverage * 0.5 + categoryCoverage * 0.5;
  const knownRatioAdjustment = 0.5 + 0.5 * knownRatio;
  const overallConfidence = clamp(coverageConfidence * knownRatioAdjustment - contradictionPenalty, 0, 1);
  const overallConfidenceLabel = labelConfidence(overallConfidence);

  const overallScore = overallConfidenceLabel === "insufficient" || overallRaw === null ? null : Math.round(clamp(overallRaw, 0, 100));
  const scoreBand = overallScore !== null ? (SCORE_BANDS.find((b) => overallScore >= b.min && overallScore <= b.max) ?? null) : null;

  const strongest = scorable.length ? scorable.reduce((a, b) => (b.normalizedScore > a.normalizedScore ? b : a)) : null;
  const weakest = scorable.length ? scorable.reduce((a, b) => (b.normalizedScore < a.normalizedScore ? b : a)) : null;

  const allWeaknesses = categoryResults.flatMap((r) => r.weaknesses);
  const allStrengths = categoryResults.flatMap((r) => r.strengths);
  const { doNow, doNext, doLater, notYet } = prioritizeWeaknesses(allWeaknesses, categoryResults);

  const quickWins = [...doNow, ...doNext].slice(0, 3).map((w) => w.countermeasure);
  const thirtyDayPlan = [doNow[0]?.countermeasure, doNext[0]?.countermeasure].filter((x): x is string => !!x);
  const ninetyDayPlan = doLater.map((w) => w.countermeasure);
  const metricsToTrack = [...new Set([doNow[0], doNext[0]].filter((x): x is GrowthWeakness => !!x).map((w) => w.metricToTrack))];

  const recommendedServices = buildServiceRecommendationsFromWeaknesses([...doNow, ...doNext, ...doLater]);
  // Zero recommended services means one of two very different things: not
  // enough was answered to find a gap (matchPlan's "not enough info" path
  // is correct), or the business is genuinely strong and has no material
  // gap (matchPlan's generic messaging would misleadingly read as "unclear
  // fit" for someone doing great) — branch so a strong score never gets a
  // confusing "let's have a conversation because nothing fits" message.
  const recommendedPlan =
    recommendedServices.length > 0
      ? matchPlan(recommendedServices)
      : overallScore !== null && overallScore >= 70
        ? {
            planId: "custom-partnership" as const,
            name: "No Standard Plan Needed Right Now",
            reason:
              "No significant gaps were identified. This is a strong, well-run business. A Monthly Growth Partnership is worth considering only if you want an ongoing partner for the next stage, not because anything here needs fixing.",
            included: ["An ongoing partner for continued, deliberate growth, if wanted"],
            notIncluded: ["N/A, nothing urgent to address"],
            nextStep: "No action required. Reach out only if you'd like a growth partner for what's next.",
          }
        : matchPlan([]);
  const immediateNextAction =
    doNow[0]?.countermeasure ??
    (overallConfidenceLabel === "insufficient"
      ? "Answer a few more questions so I can identify your highest-priority action with confidence."
      : "Nothing urgent stood out. Keep doing what's working, and revisit this assessment periodically to catch new gaps early.");

  return {
    mode,
    generatedAt: Date.now(),
    overallScore,
    scoreBand,
    overallConfidence,
    overallConfidenceLabel,
    categoriesEvaluated: evaluated.map((r) => r.categoryId),
    categoriesMissing: missing.map((r) => r.categoryId),
    categoryResults,
    strongestCategory: strongest?.categoryId ?? null,
    weakestCategory: weakest?.categoryId ?? null,
    highestPriorityGap: doNow[0]?.what ?? null,
    topStrengths: allStrengths.slice(0, 3),
    topWeaknesses: allWeaknesses.slice(0, 3),
    quickWins,
    doNow: doNow.map((w) => w.countermeasure),
    doNext: doNext.map((w) => w.countermeasure),
    doLater: doLater.map((w) => w.countermeasure),
    notYet: notYet.map((w) => w.countermeasure),
    thirtyDayPlan,
    ninetyDayPlan,
    metricsToTrack,
    recommendedServices,
    recommendedPlan,
    immediateNextAction,
    contradictionsDetected: contradictions,
    infoUsed: scorable.map((r) => `${r.label} (${r.questionsAnswered} question${r.questionsAnswered === 1 ? "" : "s"} answered)`),
    infoMissing: missing.map((r) => r.label),
    confidenceExplanation: confidenceExplanation(overallConfidenceLabel, coverage, categoryCoverage, contradictions),
  };
}

/** Dev/test sanity check — no duplicate ids, positive weights, no duplicate question ids across the whole config. */
export function validateGrowthScoreConfig(): string[] {
  const problems: string[] = [];
  const categoryIds = new Set<string>();
  const questionIds = new Set<string>();
  for (const category of GROWTH_SCORE_CATEGORIES) {
    if (categoryIds.has(category.id)) problems.push(`Duplicate category id: ${category.id}`);
    categoryIds.add(category.id);
    if (category.weight <= 0) problems.push(`Non-positive weight for category ${category.id}`);
    for (const question of category.questions) {
      if (questionIds.has(question.id)) problems.push(`Duplicate question id: ${question.id}`);
      questionIds.add(question.id);
      if (question.options.some((o) => o.points < 0 || o.points > question.maxPoints)) {
        problems.push(`Question ${question.id} has an option outside 0..maxPoints`);
      }
    }
  }
  return problems;
}
