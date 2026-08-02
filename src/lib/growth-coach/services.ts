import type { ServiceId, ServiceRecommendation } from "@/types";

/**
 * Centralized catalog of everything Next Level Growth offers. Kept
 * separate from the recommendation logic below so the two can change
 * independently — editing a service's description here never requires
 * touching the matching rules, and vice versa.
 */
type ServiceCatalogEntry = {
  id: ServiceId;
  name: string;
  problem: string;
  benefitType: string;
  whatToMeasure: string;
};

const SERVICE_CATALOG: Record<ServiceId, ServiceCatalogEntry> = {
  "website-design": {
    id: "website-design",
    name: "Website Design",
    problem: "No website, or the current one actively undersells the business.",
    benefitType: "Stronger first impression and a foundation every other channel can point to.",
    whatToMeasure: "Website visits, contact form submissions and calls from the site.",
  },
  "website-redesign": {
    id: "website-redesign",
    name: "Website Redesign",
    problem: "An existing site that no longer reflects the business or converts visitors.",
    benefitType: "Improved credibility and conversion without starting from zero.",
    whatToMeasure: "Visitor-to-lead conversion rate, bounce rate on key pages.",
  },
  "website-maintenance": {
    id: "website-maintenance",
    name: "Website Maintenance",
    problem: "A working site that's at risk of slowly degrading: broken links, outdated content, missed updates.",
    benefitType: "Consistent reliability so the site keeps performing without owner attention.",
    whatToMeasure: "Uptime, page load time, content freshness.",
  },
  "local-seo": {
    id: "local-seo",
    name: "Local SEO",
    problem: "Customers who are actively searching aren't finding the business.",
    benefitType: "More visibility in the searches that already have buying intent.",
    whatToMeasure: "Search visibility for core service terms, Google Business Profile views.",
  },
  "gbp-optimization": {
    id: "gbp-optimization",
    name: "Google Business Profile Optimization",
    problem: "An incomplete or inactive Google Business Profile, often the first thing a local customer sees.",
    benefitType: "Higher local visibility and more trust before a visitor even reaches the website.",
    whatToMeasure: "Profile views, calls and direction requests from the listing.",
  },
  "reputation-reviews": {
    id: "reputation-reviews",
    name: "Online Reputation & Review Strategy",
    problem: "Too few (or unmanaged) reviews, which quietly undermines trust and local ranking.",
    benefitType: "A steady, honest flow of new reviews and a plan for responding to all of them.",
    whatToMeasure: "Review count, average rating, response rate.",
  },
  "ai-chatbot": {
    id: "ai-chatbot",
    name: "AI Chatbot Implementation",
    problem: "Inquiries go unanswered outside business hours or during busy periods.",
    benefitType: "Faster first response and fewer missed inquiries, with clear disclosure it's automated.",
    whatToMeasure: "Response time, inquiries captured after hours.",
  },
  "ai-workflow-automation": {
    id: "ai-workflow-automation",
    name: "AI Workflow Automation",
    problem: "Repetitive manual tasks (follow-ups, scheduling, data entry) eat hours every week.",
    benefitType: "Time returned to the owner without adding headcount.",
    whatToMeasure: "Hours saved per week, task completion consistency.",
  },
  "lead-capture-systems": {
    id: "lead-capture-systems",
    name: "Lead-Capture Systems",
    problem: "Interested visitors leave without a clear, easy way to make contact.",
    benefitType: "More of the traffic already arriving gets converted into an actual inquiry.",
    whatToMeasure: "Lead-capture rate, form completion rate.",
  },
  "crm-setup": {
    id: "crm-setup",
    name: "CRM Setup",
    problem: "Leads are tracked by memory or scattered notes, and some quietly fall through the cracks.",
    benefitType: "One reliable place to see every lead's status.",
    whatToMeasure: "Leads with no follow-up recorded, pipeline visibility.",
  },
  "follow-up-automation": {
    id: "follow-up-automation",
    name: "Follow-Up Automation",
    problem: "Slow or inconsistent follow-up after the first contact costs winnable customers.",
    benefitType: "A consistent, timely follow-up sequence that doesn't depend on remembering to do it.",
    whatToMeasure: "Average first-response time, leads contacted vs. leads gone quiet.",
  },
  "marketing-strategy": {
    id: "marketing-strategy",
    name: "Marketing Strategy",
    problem: "Marketing effort exists but isn't aimed at a clear goal or tracked for results.",
    benefitType: "A focused plan instead of scattered, untracked activity.",
    whatToMeasure: "Cost per lead, channel-level conversion.",
  },
  "branding-positioning": {
    id: "branding-positioning",
    name: "Branding & Positioning",
    problem: "Unclear messaging makes it hard for the right customers to recognize a fit quickly.",
    benefitType: "Clearer, more consistent positioning across every channel.",
    whatToMeasure: "Message clarity in visitor feedback, brand consistency across channels.",
  },
  "conversion-optimization": {
    id: "conversion-optimization",
    name: "Conversion Optimization",
    problem: "Traffic arrives but too few visitors take the next step.",
    benefitType: "More outcomes from the traffic and attention already being earned.",
    whatToMeasure: "Website conversion rate, calls-to-action click-through.",
  },
  "lead-generation": {
    id: "lead-generation",
    name: "Lead Generation",
    problem: "Not enough qualified people are entering the pipeline in the first place.",
    benefitType: "A steadier, more predictable flow of new inquiries.",
    whatToMeasure: "Monthly qualified leads, cost per lead.",
  },
  "monthly-growth-partnership": {
    id: "monthly-growth-partnership",
    name: "Monthly Growth Partnership",
    problem: "Multiple interconnected gaps need ongoing attention, not a single one-time fix.",
    benefitType: "Continuous, coordinated improvement across website, visibility, and systems.",
    whatToMeasure: "Progress against the 90-day roadmap at each monthly review.",
  },
};

export type RecommendationSignals = {
  sourceFlow: "assessment" | "growth-plan" | "website-review";
  priorityKey: "website" | "leads" | "visibility";
  weeklyHours: number | null;
};

function rec(id: ServiceId, relevance: string, priority: ServiceRecommendation["priority"], dependencies?: string): ServiceRecommendation {
  const entry = SERVICE_CATALOG[id];
  return {
    serviceId: entry.id,
    name: entry.name,
    problem: entry.problem,
    relevance,
    benefitType: entry.benefitType,
    priority,
    dependencies,
    whatToMeasure: entry.whatToMeasure,
  };
}

/**
 * Public version of `rec()` for callers outside this file (the Growth
 * Score engine) that need to build a `ServiceRecommendation` from the same
 * centralized catalog — keeps exactly one source of truth for service
 * names/descriptions no matter which recommendation path produced them.
 */
export function buildServiceRecommendation(
  id: ServiceId,
  relevance: string,
  priority: ServiceRecommendation["priority"],
  dependencies?: string
): ServiceRecommendation {
  return rec(id, relevance, priority, dependencies);
}

/**
 * Deterministic, traceable mapping from what actually happened in the
 * conversation to a short list of relevant services — never the full
 * catalog, and never a service the conversation didn't actually surface a
 * need for.
 */
export function recommendServices(signals: RecommendationSignals): ServiceRecommendation[] {
  const { sourceFlow, priorityKey, weeklyHours } = signals;
  const out: ServiceRecommendation[] = [];

  if (priorityKey === "website") {
    out.push(
      rec(
        sourceFlow === "website-review" ? "website-redesign" : "website-design",
        "This came up as the top priority. It's the asset every other effort eventually sends people back to.",
        "do-now"
      )
    );
    out.push(rec("conversion-optimization", "A stronger site still needs a clear next step on every page to convert visitors.", "do-next", "website-design/website-redesign"));
  } else if (priorityKey === "leads") {
    out.push(rec("lead-capture-systems", "Interested visitors need an easy, obvious way to make contact.", "do-now"));
    out.push(rec("follow-up-automation", "Response speed after first contact is usually the biggest lever once capture is solid.", "do-next", "lead-capture-systems"));
    out.push(rec("crm-setup", "Once volume grows, tracking by memory stops working.", "do-later", "lead-capture-systems"));
  } else {
    out.push(rec("gbp-optimization", "A complete, active Google Business Profile is usually the fastest-moving visibility lever.", "do-now"));
    out.push(rec("local-seo", "Search visibility compounds, and this builds on a completed Google Business Profile.", "do-next", "gbp-optimization"));
    out.push(rec("reputation-reviews", "Review volume and recency directly affect both trust and local ranking.", "do-next"));
  }

  if (sourceFlow === "growth-plan") {
    out.push(rec("marketing-strategy", "A 90-day goal needs marketing effort aimed at a specific target, not scattered activity.", "do-later"));
  }

  // Keep it tight when the visitor has very limited weekly time — fewer,
  // higher-leverage recommendations beat a long list they can't act on.
  if (weeklyHours !== null && weeklyHours <= 5) {
    return out.slice(0, 2);
  }

  return out.slice(0, 4);
}
