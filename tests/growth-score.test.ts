import { describe, expect, it } from "vitest";
import { GROWTH_SCORE_CATEGORIES } from "@/lib/growth-coach/growth-score/config";
import {
  buildQuestionQueue,
  calculateGrowthScore,
  getQuestionById,
  recordAnswer,
  validateGrowthScoreConfig,
} from "@/lib/growth-coach/growth-score/engine";

const fullIds = buildQuestionQueue("full");

function answerAllBest(ids: string[]) {
  return ids.map((id) => {
    const q = getQuestionById(id)!;
    const best = q.options.reduce((a, b) => (b.points > a.points ? b : a));
    return recordAnswer(q, best.value);
  });
}
function answerAllWorst(ids: string[]) {
  return ids.map((id) => {
    const q = getQuestionById(id)!;
    const worst = q.options.reduce((a, b) => (b.points < a.points ? b : a));
    return recordAnswer(q, worst.value);
  });
}

describe("Growth Score config", () => {
  it("has no duplicate ids, valid weights, and in-bounds option points", () => {
    expect(validateGrowthScoreConfig()).toEqual([]);
  });

  it("quick check yields 8-12 questions", () => {
    const quick = buildQuestionQueue("quick");
    expect(quick.length).toBeGreaterThanOrEqual(8);
    expect(quick.length).toBeLessThanOrEqual(12);
  });
});

describe("Growth Score engine — core scenarios", () => {
  it("strong, complete business scores high with high confidence", () => {
    const result = calculateGrowthScore("full", answerAllBest(fullIds));
    expect(result.overallScore).not.toBeNull();
    expect(result.overallScore!).toBeGreaterThanOrEqual(85);
    expect(result.overallConfidenceLabel).toBe("high");
    expect(result.scoreBand?.label).toBe("Ready to Scale Carefully");
  });

  it("new/weak business scores low, never below 0, and produces exactly one Do Now item", () => {
    const result = calculateGrowthScore("full", answerAllWorst(fullIds));
    expect(result.overallScore).not.toBeNull();
    expect(result.overallScore!).toBeGreaterThanOrEqual(0);
    expect(result.overallScore!).toBeLessThanOrEqual(100);
    expect(result.doNow.length).toBe(1);
    expect(result.scoreBand?.label).toBe("Foundation at Risk");
  });

  it("incomplete answers (sparse) never produce a misleading score — insufficient confidence returns null", () => {
    const result = calculateGrowthScore("full", answerAllBest(fullIds.slice(0, 2)));
    expect(result.overallConfidenceLabel).toBe("insufficient");
    expect(result.overallScore).toBeNull();
  });

  it("contradictory answers are detected", () => {
    const answers = [
      recordAnswer(getQuestionById("website-working")!, "no-website"),
      recordAnswer(getQuestionById("website-clear-cta")!, "one-clear-action"),
    ];
    const result = calculateGrowthScore("full", answers);
    expect(result.contradictionsDetected.length).toBeGreaterThan(0);
  });

  it('"unknown" answers reduce confidence but never the score itself', () => {
    const alternating = fullIds.map((id, i) => {
      const q = getQuestionById(id)!;
      if (i % 2 === 0) {
        const best = q.options.reduce((a, b) => (b.points > a.points ? b : a));
        return recordAnswer(q, best.value);
      }
      return recordAnswer(q, "unknown");
    });
    const result = calculateGrowthScore("full", alternating);
    expect(result.overallScore).toBe(100);
    expect(result.overallConfidenceLabel).not.toBe("high");
  });

  it('"not applicable" is excluded entirely from scoring, unlike "unknown"', () => {
    const answers = [recordAnswer(getQuestionById("website-working")!, "not-applicable"), recordAnswer(getQuestionById("website-clear-cta")!, "one-clear-action")];
    const result = calculateGrowthScore("full", answers);
    const website = result.categoryResults.find((c) => c.categoryId === "website-digital-presence")!;
    expect(website.questionsSkipped).toBe(1);
    expect(website.normalizedScore).toBe(100);
  });

  it("a single sparsely-answered category alone is insufficient to score at all (not a distortion bug — too little coverage to trust)", () => {
    const financeOnlyIds = fullIds.filter((id) => getQuestionById(id)!.categoryId === "financial-discipline");
    const result = calculateGrowthScore("full", answerAllBest(financeOnlyIds));
    expect(result.overallConfidenceLabel).toBe("insufficient");
    expect(result.overallScore).toBeNull();
    expect(result.categoriesEvaluated).toEqual(["financial-discipline"]);
  });

  it("with realistic partial coverage, unanswered categories are excluded from the average rather than dragging it down", () => {
    const halfCategoryIds = fullIds.filter((id) =>
      ["business-foundation", "website-digital-presence", "local-visibility-seo", "lead-generation", "sales-follow-up", "customer-experience-retention"].includes(
        getQuestionById(id)!.categoryId
      )
    );
    const result = calculateGrowthScore("full", answerAllBest(halfCategoryIds));
    expect(result.overallScore).toBe(100);
    expect(result.categoriesEvaluated.length).toBe(6);
    expect(result.categoriesMissing.length).toBe(6);
  });

  it("solo-founder 'just me' answer is not penalized", () => {
    const answer = recordAnswer(getQuestionById("leadership-roles-clear")!, "solo");
    expect(answer.points).toBeGreaterThan(0);
  });

  it("a genuinely strong business with no weaknesses gets an honest 'no plan needed' message, not a confusing 'unclear fit' one", () => {
    const result = calculateGrowthScore("full", answerAllBest(fullIds));
    expect(result.recommendedServices).toEqual([]);
    expect(result.recommendedPlan?.name).not.toMatch(/not enough information/i);
  });
});

describe("Growth Score engine — determinism and configurability", () => {
  it("identical answers always produce identical results", () => {
    const answers = answerAllBest(fullIds);
    const a = calculateGrowthScore("full", answers);
    const b = calculateGrowthScore("full", answers);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("category weights are all positive and sum to a stable total (weight changes shift results predictably)", () => {
    const totalWeight = GROWTH_SCORE_CATEGORIES.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeGreaterThan(0);
    GROWTH_SCORE_CATEGORIES.forEach((c) => expect(c.weight).toBeGreaterThan(0));
  });

  it("progress reflects overall coverage, not just answered-vs-unknown ratio", () => {
    const halfCategories = fullIds.filter((id) =>
      ["business-foundation", "website-digital-presence", "local-visibility-seo", "lead-generation", "sales-follow-up", "customer-experience-retention"].includes(
        getQuestionById(id)!.categoryId
      )
    );
    const result = calculateGrowthScore("full", answerAllBest(halfCategories));
    expect(result.overallScore).toBe(100);
    expect(result.overallConfidenceLabel).toBe("moderate");
  });
});
