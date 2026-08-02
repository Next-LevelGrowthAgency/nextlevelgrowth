import type { LeadProfile } from "@/types";

export type DashboardOverview = {
  funnel: { label: string; count: number }[];
  totalLeads: number;
  averageGrowthScore: number | null;
  averageConfidenceLabel: string | null;
  conversionRate: number | null; // leads submitted / coach opens
  topWeaknessCategories: { label: string; count: number }[];
  topStrengthCategories: { label: string; count: number }[];
  topServices: { label: string; count: number }[];
  topPlans: { label: string; count: number }[];
  topIndustries: { label: string; count: number }[];
  topCities: { label: string; count: number }[];
  newLeads: number;
  followUpDue: number;
  highPriorityLeads: number;
};

function countBy<T>(items: T[], keyFn: (item: T) => string | undefined | null): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

const CONFIDENCE_RANK: Record<string, number> = { insufficient: 0, low: 1, moderate: 2, high: 3 };
const CONFIDENCE_LABEL_BY_RANK = ["insufficient", "low", "moderate", "high"];

export function buildDashboardOverview(leads: LeadProfile[], counters: Record<string, number>): DashboardOverview {
  const count = (event: string) => counters[event] ?? 0;

  const funnel = [
    { label: "Coach opened", count: count("coach_opened") },
    { label: "Assessment started", count: count("quick_check_started") + count("full_assessment_started") + count("assessment_started") },
    { label: "Growth Score generated", count: count("growth_score_generated") },
    { label: "Report offered", count: count("report_offered") },
    { label: "Report accepted", count: count("report_accepted") },
    { label: "Lead form opened", count: count("lead_form_opened") },
    { label: "Lead submitted", count: count("lead_form_completed") },
    { label: "Consultation requested", count: count("consultation_accepted") },
  ];

  const scores = leads.map((l) => l.growthScore).filter((s): s is number => typeof s === "number");
  const averageGrowthScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const confidenceRanks = leads.map((l) => (l.growthScoreConfidence ? CONFIDENCE_RANK[l.growthScoreConfidence] : undefined)).filter((r): r is number => r !== undefined);
  const averageConfidenceLabel =
    confidenceRanks.length > 0 ? CONFIDENCE_LABEL_BY_RANK[Math.round(confidenceRanks.reduce((a, b) => a + b, 0) / confidenceRanks.length)] : null;

  const coachOpens = count("coach_opened");
  const leadsSubmitted = count("lead_form_completed");
  const conversionRate = coachOpens > 0 ? Math.round((leadsSubmitted / coachOpens) * 1000) / 10 : null;

  const weakCategories = leads.flatMap((l) => (l.growthCategorySnapshot ?? []).filter((c) => c.score <= 40).map((c) => c.label));
  const strongCategories = leads.flatMap((l) => (l.growthCategorySnapshot ?? []).filter((c) => c.score >= 70).map((c) => c.label));

  return {
    funnel,
    totalLeads: leads.length,
    averageGrowthScore,
    averageConfidenceLabel,
    conversionRate,
    topWeaknessCategories: countBy(weakCategories, (c) => c),
    topStrengthCategories: countBy(strongCategories, (c) => c),
    topServices: countBy(
      leads.flatMap((l) => l.recommendedServices ?? []),
      (s) => s.name
    ),
    topPlans: countBy(leads, (l) => l.recommendedPlan?.name),
    topIndustries: countBy(leads, (l) => l.industry),
    topCities: countBy(leads, (l) => l.city),
    newLeads: leads.filter((l) => (l.followUpStatus ?? "new") === "new").length,
    followUpDue: leads.filter((l) => l.followUpStatus === "follow-up-needed").length,
    highPriorityLeads: leads.filter((l) => l.leadQualificationLevel === "high-priority-follow-up").length,
  };
}
