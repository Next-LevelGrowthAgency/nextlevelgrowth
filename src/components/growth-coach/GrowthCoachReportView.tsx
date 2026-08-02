"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";
import type { BusinessGrowthReport } from "@/types";
import { Printer, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { BulletList, PRIORITY_LABEL, Section } from "./report-ui";

export function GrowthCoachReportView({
  report,
  onClose,
  onRequestSave,
  alreadySaved,
}: {
  report: BusinessGrowthReport;
  onClose: () => void;
  onRequestSave: () => void;
  alreadySaved: boolean;
}) {
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

  const date = new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Business Growth Report"
      className="fixed inset-0 z-[60] overflow-y-auto bg-paper-100 print:static print:overflow-visible"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 backdrop-blur print:hidden sm:px-8">
        <p className="text-sm font-semibold text-ink-900">Next Level Growth Business Growth Report</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-900"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print / Save as PDF
          </button>
          <button type="button" onClick={onClose} aria-label="Close report" className="rounded-full p-1.5 text-ink-500 hover:bg-ink-100">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 print:max-w-none print:px-0 print:py-0 sm:px-8">
        {/* Cover */}
        <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-soft print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex items-center gap-2 text-grove-700">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide">{siteConfig.name}</span>
          </div>
          <h1 className="mt-4 font-display text-display-md text-ink-900">Business Growth Report</h1>
          <p className="mt-1 text-ink-600">A focused roadmap to help your business reach its next level.</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink-500">Business</dt>
              <dd className="font-medium text-ink-900">{report.businessName ?? "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Prepared for</dt>
              <dd className="font-medium text-ink-900">{report.visitorName ?? "You"}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Date</dt>
              <dd className="font-medium text-ink-900">{date}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Prepared by</dt>
              <dd className="font-medium text-ink-900">Next Level Growth Coach</dd>
            </div>
          </dl>
        </div>

        {report.growthScore ? (
          <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-900 p-8 text-paper-100 shadow-soft print:rounded-none print:border print:border-ink-200 print:bg-white print:text-ink-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-grove-300 print:text-grove-700">Next Level Growth Score</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-5xl font-semibold">{report.growthScore.overallScore ?? "–"}</span>
              <span className="text-paper-400 print:text-ink-500">/ 100</span>
            </div>
            <p className="mt-1 font-medium">{report.growthScore.scoreBand?.label ?? "Not enough information yet"}</p>
            <p className="mt-2 text-sm text-paper-300 print:text-ink-600">
              Confidence: {report.growthScore.overallConfidenceLabel}. {report.growthScore.confidenceExplanation}
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-8 shadow-soft print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <Section title="Executive Summary">
            <p>{report.executiveSummary}</p>
          </Section>
          <Section title="Current State">
            <p>{report.currentState}</p>
          </Section>
          <Section title="Ideal State">
            <p>{report.idealState}</p>
          </Section>
          <Section title="The Growth Gap">
            <p>{report.growthGap}</p>
          </Section>
          <Section title="Likely Root Causes">
            <p className="mb-2 text-xs italic text-ink-500">
              Preliminary: based on this conversation, not a technical audit.
            </p>
            <BulletList items={report.rootCauses} />
          </Section>
          <Section title="Business Strengths">
            <BulletList items={report.strengths} />
          </Section>
          <Section title="Top Opportunities">
            <BulletList items={report.topOpportunities} />
          </Section>
          <Section title="Quick Wins">
            <BulletList items={report.quickWins} />
          </Section>
          <Section title="30-Day Action Plan">
            <BulletList items={report.thirtyDayPlan} />
          </Section>
          <Section title="90-Day Growth Roadmap">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Days 1–30</p>
                <BulletList items={report.ninetyDayRoadmap.days1to30} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Days 31–60</p>
                <BulletList items={report.ninetyDayRoadmap.days31to60} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Days 61–90</p>
                <BulletList items={report.ninetyDayRoadmap.days61to90} />
              </div>
            </div>
          </Section>
          <Section title="Key Metrics to Track">
            <BulletList items={report.keyMetrics} />
          </Section>
          <Section title="Risks & Constraints">
            <BulletList items={report.risksAndConstraints} />
          </Section>
          <Section title="Recommended Next Level Growth Services">
            <div className="space-y-4">
              {report.recommendedServices.map((service) => (
                <div key={service.serviceId} className="rounded-xl border border-ink-100 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{service.name}</p>
                    <Badge tone={service.priority === "do-now" ? "grove" : service.priority === "do-next" ? "signal" : "ink"}>
                      {PRIORITY_LABEL[service.priority]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{service.relevance}</p>
                  <p className="mt-1 text-xs text-ink-500">Measure: {service.whatToMeasure}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Recommended Service Plan">
            <p className="font-medium text-ink-900">{report.recommendedPlan.name}</p>
            <p className="mt-1">{report.recommendedPlan.reason}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Included</p>
                <BulletList items={report.recommendedPlan.included} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Not Included</p>
                <BulletList items={report.recommendedPlan.notIncluded} />
              </div>
            </div>
          </Section>
          <Section title="Next Action">
            <p className="font-medium text-ink-900">{report.nextAction}</p>
          </Section>
          <Section title="Optional Strategy Conversation">
            <p>
              If it would help to talk through any of this, Next Level Growth offers a free, no-pressure strategy
              conversation, entirely optional, and only if it's useful to you.
            </p>
          </Section>
          {report.growthScore ? (
            <Section title="How the Score Was Calculated">
              <p className="text-xs text-ink-500">
                {report.growthScore.categoriesEvaluated.length} of {report.growthScore.categoriesEvaluated.length + report.growthScore.categoriesMissing.length}{" "}
                categories evaluated. This is educational guidance based on your answers. It is not a business valuation, and it does not guarantee future performance.
              </p>
              <div className="mt-3 space-y-2">
                {report.growthScore.categoryResults
                  .filter((c) => c.questionsAnswered > 0)
                  .map((c) => (
                    <div key={c.categoryId} className="flex items-center justify-between gap-3 text-sm">
                      <span>{c.label}</span>
                      <span className="font-medium text-ink-900">{Math.round(c.normalizedScore)}/100</span>
                    </div>
                  ))}
              </div>
              {report.growthScore.infoMissing.length > 0 ? (
                <p className="mt-3 text-xs text-ink-500">Not yet assessed: {report.growthScore.infoMissing.join(", ")}.</p>
              ) : null}
            </Section>
          ) : null}
          <Section title="Disclaimer">
            <p className="text-xs text-ink-500">
              This report provides educational business, marketing, and technology guidance based on the
              information shared in this conversation. It is not legal, tax, accounting, investment, medical, or
              other licensed professional advice, and does not guarantee any specific result. No live technical
              scan of any website was performed to produce this report.
            </p>
          </Section>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 pb-10 print:hidden sm:flex-row sm:justify-center">
          {alreadySaved ? (
            <p className="text-sm font-medium text-grove-700">This report has been saved and sent.</p>
          ) : (
            <Button variant="primary" onClick={onRequestSave}>
              Save &amp; email me this report
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Back to coaching
          </Button>
        </div>
      </div>
    </div>
  );
}
