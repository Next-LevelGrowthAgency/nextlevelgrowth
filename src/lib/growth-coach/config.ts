import type { CoachingMode, SuggestedPrompt } from "@/types";

/**
 * NEXT LEVEL GROWTH COACH — CENTRALIZED CONFIGURATION
 * ------------------------------------------------------------------
 * Identity, copy, and personality data for the Growth Coach experience.
 * The conversational logic that reads this data lives in ./engine.ts —
 * keeping the two separate means the coach's voice can be tuned here
 * without touching UI or state-machine code.
 *
 * Phase 2 note: `personalityPrinciples` and `coachingModes` are written to
 * double as source material for a future system prompt once a real AI
 * provider is wired into src/app/api/chat/route.ts.
 */

export const coachIdentity = {
  name: "Next Level Growth Coach",
  tagline: "Your AI-powered coach for stronger strategy, smarter systems, and measurable business growth.",
  supportingLine: "Build clarity. Take action. Reach your next level.",
  subtitle: "Your AI-powered business growth coach",
  status: "Business clarity. Practical strategy. Real growth.",
  fabLabel: "Growth Coach",
  fabSupportingLine: "Build your next move.",
  fabTooltip: "Start your growth plan",
} as const;

export const welcomeMessage =
  `Welcome to Next Level Growth Coach.

You do not need another generic list of business tips. You need clarity, priorities, and a plan you can actually execute.

I'll help you understand where your business stands, identify the biggest opportunity, and turn it into practical next steps.

What are we working on today?`;

export const disclaimerText =
  "Next Level Growth Coach provides educational business, marketing, and technology guidance. It does not provide legal, tax, investment, accounting, medical, or other licensed professional advice. Recommendations should be evaluated based on your specific circumstances.";

export const previewNotice =
  "Preview experience: responses are demonstration content, not a live AI connection.";

/**
 * Ten suggested starting prompts. "primary" tier renders on the welcome
 * screen by default; "more" tier sits behind the "More ways I can help"
 * disclosure so the initial screen stays uncluttered.
 */
export const suggestedPrompts: SuggestedPrompt[] = [
  { id: "growth-score-quick", label: "Get My Growth Score", icon: "Gauge", tier: "primary" },
  { id: "analyze", label: "Analyze My Business", icon: "Compass", tier: "primary" },
  { id: "growth-plan", label: "Build My 90-Day Growth Plan", icon: "CalendarRange", tier: "primary" },
  { id: "website-review", label: "Review My Website", icon: "LayoutTemplate", tier: "primary" },
  { id: "leads", label: "Help Me Generate More Leads", icon: "Users", tier: "primary" },
  { id: "growth-score-full", label: "Take the Full Growth Assessment", icon: "ClipboardList", tier: "more" },
  { id: "google-visibility", label: "Improve My Google Visibility", icon: "MapPin", tier: "more" },
  { id: "marketing", label: "Strengthen My Marketing", icon: "Megaphone", tier: "more" },
  { id: "systems", label: "Build Better Business Systems", icon: "Workflow", tier: "more" },
  { id: "automation", label: "Create an AI Automation Plan", icon: "Bot", tier: "more" },
  { id: "prioritize", label: "Help Me Prioritize", icon: "ListChecks", tier: "more" },
  { id: "challenge", label: "Coach Me Through a Business Challenge", icon: "Target", tier: "more" },
];

/**
 * The leadership/coaching philosophy the engine's copy is written from.
 * Not rendered directly in the UI — kept here as the source of truth for
 * tone, and reusable as system-prompt material in Phase 2.
 */
export const personalityPrinciples = [
  "Growth requires action, not just ideas.",
  "Large goals become manageable when broken into clear steps.",
  "Every recommendation should connect to a measurable business outcome.",
  "Strong systems produce consistent results.",
  "High standards matter, but perfection should not delay progress.",
  "A good coach listens before offering solutions.",
  "Accountability should be direct without being disrespectful.",
  "Encouragement should be genuine, not artificial.",
  "People should leave conversations feeling stronger, clearer, and more capable.",
  "Never make a user feel unintelligent for not knowing something.",
  "Simplify complicated ideas instead of adding jargon.",
  "Recognize progress, then keep moving toward the next meaningful action.",
  "The goal is sustainable growth, not quick tricks or unrealistic promises.",
] as const;

export const coachingModes: Record<CoachingMode, { label: string; badgeTone: "ink" | "grove" | "signal" | "ember" }> = {
  clarity: { label: "Clarity Mode", badgeTone: "signal" },
  strategy: { label: "Strategy Mode", badgeTone: "ink" },
  execution: { label: "Execution Mode", badgeTone: "grove" },
  performance: { label: "Performance Mode", badgeTone: "signal" },
  encouragement: { label: "Encouragement Mode", badgeTone: "ember" },
  challenge: { label: "Challenge Mode", badgeTone: "ink" },
  "life-design": { label: "Life Design Mode", badgeTone: "ember" },
  "financial-discipline": { label: "Financial Discipline Mode", badgeTone: "ink" },
  founder: { label: "Founder Mode", badgeTone: "grove" },
};

export const growthScoreIntro = {
  quick:
    "Let's get you a preliminary Next Level Growth Score. I'll ask about 10 quick questions across the core areas of the business. Pick the closest answer, or say you're not sure. A few minutes, and you'll have a real, honest read on where things stand.",
  full:
    "This is the complete picture: around two dozen questions across every part of the business, a couple at a time. Answer what you can. \"I don't know\" and \"not applicable\" are both completely fine anywhere they fit.",
};

export const consultOfferText =
  "Based on what you shared, there may be an opportunity for Next Level Growth to help you implement this. Would you like to explore a free strategy conversation?";

export const consultDeclineReply =
  "No pressure at all. Let's keep building. What would you like to work through next?";
