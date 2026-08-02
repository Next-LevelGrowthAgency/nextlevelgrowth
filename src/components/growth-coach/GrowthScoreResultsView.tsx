"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import type { GrowthScoreResult } from "@/types";
import { ChevronDown, Printer, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BulletList, PRIORITY_BADGE_TONE, PRIORITY_LABEL, Section } from "./report-ui";

function CategoryBar({ label, score, confidenceLabel }: { label: string; score: number; confidenceLabel: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-800">{label}</span>
        <span className="font-medium text-ink-900">
          {Math.round(score)}/100 <span className="font-normal text-ink-500">({confidenceLabel})</span>
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-paper-200" role="img" aria-label={`${label}: ${Math.round(score)} out of 100`}>
        <div className="h-2 rounded-full bg-grove-600" style={{ width: `${Math.max(2, Math.round(score))}%` }} />
      </div>
    </div>
  );
}

export function GrowthScoreResultsView({
  result,
  onClose,
  onTakeFullAssessment,
  onViewFullReport,
}: {
  result: GrowthScoreResult;
  onClose: () => void;
  onTakeFullAssessment?: () => void;
  onViewFullReport?: () => void;
}) {
  const [showCalculation, setShowCalculation] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const evaluatedCategories = result.categoryResults.filter((c) => c.questionsAnswered > 0);
  const priorityGroups = [
    { label: "Do Now", items: result.doNow, tone: PRIORITY_BADGE_TONE["do-now"] },
    { label: "Do Next", items: result.doNext, tone: PRIORITY_BADGE_TONE["do-next"] },
    { label: "Do Later", items: result.doLater, tone: PRIORITY_BADGE_TONE["do-later"] },
    { label: "Not Yet", items: result.notYet, tone: PRIORITY_BADGE_TONE["not-yet"] },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Next Level Growth Score results"
      className="fixed inset-0 z-[65] overflow-y-auto bg-paper-100 print:static print:overflow-visible"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 backdrop-blur print:hidden sm:px-8">
        <p className="text-sm font-semibold text-ink-900">Next Level Growth Score</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-900"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print
          </button>
          <button type="button" onClick={onClose} aria-label="Close results" className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:px-0 print:py-0 sm:px-8">
        <div className="rounded-2xl border border-ink-100 bg-ink-900 p-8 text-paper-100 shadow-soft print:rounded-none print:border print:border-ink-200 print:bg-white print:text-ink-900">
          <div className="flex items-center gap-2 text-grove-300 print:text-grove-700">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide">{siteConfig.name}</span>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-paper-400 print:text-ink-500">
            {result.mode === "quick" ? "Quick Growth Check" : "Full Growth Assessment"}
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-6xl font-semibold">{result.overallScore ?? "–"}</span>
            <span className="text-paper-400 print:text-ink-500">/ 100</span>
          </div>
          <p className="mt-1 text-lg font-medium">{result.scoreBand?.label ?? "Not enough information yet"}</p>
          <p className="mt-3 max-w-xl text-sm text-paper-300 print:text-ink-600">{result.scoreBand?.message ?? result.confidenceExplanation}</p>
          <div className="mt-4">
            <Badge tone={result.overallConfidenceLabel === "high" ? "grove" : result.overallConfidenceLabel === "insufficient" ? "ember" : "signal"}>
              {result.overallConfidenceLabel} confidence
            </Badge>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-8 shadow-soft print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <Section title="Category Comparison">
            {evaluatedCategories.length > 0 ? (
              <div className="space-y-4">
                {evaluatedCategories.map((c) => (
                  <CategoryBar key={c.categoryId} label={c.label} score={c.normalizedScore} confidenceLabel={c.confidenceLabel} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">Not enough answers yet to compare categories.</p>
            )}
          </Section>

          <Section title="Top Strengths">
            <BulletList items={result.topStrengths.map((s) => s.what)} />
          </Section>
          <Section title="Top Weaknesses">
            <BulletList items={result.topWeaknesses.map((w) => w.what)} />
          </Section>
          <Section title="Biggest Bottleneck">
            <p>{result.highestPriorityGap ?? "Not yet clear from the information gathered."}</p>
          </Section>

          <Section title="Priorities">
            <div className="grid gap-4 sm:grid-cols-2">
              {priorityGroups.map((group) => (
                <div key={group.label} className="rounded-xl border border-ink-100 p-4">
                  <Badge tone={group.tone}>{group.label}</Badge>
                  <div className="mt-2">
                    <BulletList items={group.items} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Quick Wins">
            <BulletList items={result.quickWins} />
          </Section>
          <Section title="30-Day Plan">
            <BulletList items={result.thirtyDayPlan} />
          </Section>
          <Section title="90-Day Roadmap">
            <BulletList items={result.ninetyDayPlan} />
          </Section>
          <Section title="Metrics to Track">
            <BulletList items={result.metricsToTrack} />
          </Section>

          {result.recommendedServices.length > 0 ? (
            <Section title="Recommended Next Level Growth Services">
              <div className="space-y-3">
                {result.recommendedServices.map((service) => (
                  <div key={service.serviceId} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink-900">{service.name}</p>
                      <Badge tone={PRIORITY_BADGE_TONE[service.priority]}>{PRIORITY_LABEL[service.priority]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">{service.relevance}</p>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {result.recommendedPlan ? (
            <Section title="Recommended Plan">
              <p className="font-medium text-ink-900">{result.recommendedPlan.name}</p>
              <p className="mt-1">{result.recommendedPlan.reason}</p>
            </Section>
          ) : null}

          <Section title="Immediate Next Action">
            <p className="font-medium text-ink-900">{result.immediateNextAction}</p>
          </Section>

          <section className="border-t border-ink-100 py-6 print:hidden">
            <button
              type="button"
              onClick={() => setShowCalculation((v) => !v)}
              aria-expanded={showCalculation}
              className="flex w-full items-center justify-between text-left"
            >
              <h2 className="font-display text-lg font-semibold text-ink-900">How This Score Was Calculated</h2>
              <ChevronDown className={`h-5 w-5 text-ink-500 transition-transform ${showCalculation ? "rotate-180" : ""} motion-reduce:transition-none`} aria-hidden="true" />
            </button>
            {showCalculation ? (
              <div className="mt-3 space-y-3 text-sm text-ink-600">
                <p>
                  {result.categoriesEvaluated.length} of {result.categoriesEvaluated.length + result.categoriesMissing.length} categories evaluated, using the
                  weight each category carries in the overall score.
                </p>
                <div>
                  <p className="font-medium text-ink-800">Information used:</p>
                  <BulletList items={result.infoUsed} />
                </div>
                {result.infoMissing.length > 0 ? (
                  <div>
                    <p className="font-medium text-ink-800">Information missing:</p>
                    <BulletList items={result.infoMissing} />
                  </div>
                ) : null}
                {result.contradictionsDetected.length > 0 ? (
                  <div>
                    <p className="font-medium text-ink-800">Flagged for clarification:</p>
                    <BulletList items={result.contradictionsDetected} />
                  </div>
                ) : null}
                <p className="text-xs text-ink-500">
                  {result.confidenceExplanation} This is educational guidance based on your answers. It is not a business valuation, and it does not guarantee
                  future performance.
                </p>
              </div>
            ) : null}
          </section>

          <Section title="Disclaimer">
            <p className="text-xs text-ink-500">
              This score provides educational business guidance based on the information you shared. It is not a business valuation, and it does not
              guarantee future performance or results.
            </p>
          </Section>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 pb-10 print:hidden sm:flex-row sm:justify-center">
          {result.mode === "quick" && onTakeFullAssessment ? (
            <Button variant="primary" onClick={onTakeFullAssessment}>
              Take the Full Assessment
            </Button>
          ) : null}
          {result.mode === "full" && onViewFullReport ? (
            <Button variant="primary" onClick={onViewFullReport}>
              View Full Business Growth Report
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>
            Back to coaching
          </Button>
        </div>
      </div>
    </div>
  );
}
