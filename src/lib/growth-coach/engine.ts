import { primaryCta } from "@/lib/site-config";
import type {
  BusinessGrowthReport,
  CoachContext,
  CoachingMode,
  CoachMessage,
  CoachState,
  GrowthScoreAnswer,
  GrowthScoreQuestionPrompt,
  GrowthScoreResult,
  StructuredReport,
} from "@/types";
import { buildBusinessGrowthReport, buildBusinessGrowthReportFromScore } from "./business-report";
import { consultDeclineReply, consultOfferText, growthScoreIntro } from "./config";
import { buildQuestionQueue, calculateGrowthScore, getQuestionById, recordAnswer } from "./growth-score/engine";

/**
 * NEXT LEVEL GROWTH COACH — MOCK CONVERSATION ENGINE (Phase 1)
 * ------------------------------------------------------------------
 * Pure, synchronous, and entirely local — no network calls. Given the
 * current CoachState and either a suggested-prompt id or free-typed text,
 * `respond()` returns the next CoachState and the coach's next message.
 *
 * Phase 2: this is the seam to replace. Swap the body of `respond()` for a
 * call to POST /api/chat (already scaffolded in
 * src/app/api/chat/route.ts) once a real provider is wired up there —
 * the CoachMessage/CoachState shapes are designed to survive that change.
 */

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `coach-msg-${Date.now()}-${idCounter}`;
}

const EMPTY_CONTEXT: CoachContext = {
  business: null,
  primaryGoal: null,
  mainFear: null,
  weeklyHours: null,
  currentPriority: null,
};

export function getInitialState(): CoachState {
  return {
    flow: null,
    topic: null,
    step: 0,
    answers: [],
    offeredConsult: false,
    context: EMPTY_CONTEXT,
    categoryUseCount: {},
    reportOffered: false,
    businessReport: null,
    growthAssessment: null,
    lastGrowthScore: null,
  };
}

function clearFlow(state: CoachState): CoachState {
  return { ...state, flow: null, topic: null, step: 0, answers: [] };
}

function assistantMessage(
  content: string,
  extra: Partial<Omit<CoachMessage, "id" | "role" | "content">> = {}
): CoachMessage {
  return { id: nextId(), role: "assistant", content, ...extra };
}

function withConsultOffer(state: CoachState, message: CoachMessage): { state: CoachState; message: CoachMessage } {
  if (state.offeredConsult) return { state, message };
  return {
    state: { ...state, offeredConsult: true },
    message: {
      ...message,
      content: `${message.content}\n\n${consultOfferText}`,
      quickReplies: [
        { label: "Yes, let's talk", action: "consult-yes" },
        { label: "Not yet, keep helping me", action: "consult-no" },
      ],
    },
  };
}

/**
 * Attaches the "want a full Business Growth Report?" offer to a just-
 * completed structured report — asked at most once per session. If it's
 * already been asked (accepted or declined), the report/plan are still
 * computed and stashed on state so "report-yes" stays available later,
 * but the visitor isn't asked again.
 */
function withReportOffer(
  state: CoachState,
  message: CoachMessage,
  businessReport: BusinessGrowthReport
): { state: CoachState; message: CoachMessage } {
  const stateWithReport: CoachState = { ...state, businessReport };
  if (state.reportOffered) {
    return { state: stateWithReport, message };
  }
  return {
    state: { ...stateWithReport, reportOffered: true },
    message: {
      ...message,
      content: `${message.content}\n\nWould you like me to put this together into a full Business Growth Report, with prioritized recommendations and a plan you could save?`,
      quickReplies: [
        { label: "Yes, build my report", action: "report-yes" },
        { label: "Not right now", action: "report-not-now" },
      ],
    },
  };
}

/** Called by the UI after a lead-capture submission succeeds. */
export function respondToLeadSubmission(
  state: CoachState,
  planName: string,
  consentToContact: boolean
): { state: CoachState; message: CoachMessage } {
  const base = assistantMessage(
    `Done. Your Business Growth Report is saved, and I've noted the ${planName} plan as the best fit based on what we covered.`,
    { mode: "strategy" }
  );
  if (!consentToContact) {
    return {
      state,
      message: { ...base, content: `${base.content} You're all set. No one from our team will reach out unless you choose to later.` },
    };
  }
  return withConsultOffer(state, base);
}

function extractHours(text: string): number | null {
  const match = text.match(/(\d{1,3})\s*(hours?|hrs?)/i);
  return match ? parseInt(match[1], 10) : null;
}

function mergeContext(state: CoachState, text: string): CoachState {
  const hours = extractHours(text);
  if (hours === null) return state;
  return { ...state, context: { ...state.context, weeklyHours: hours } };
}

/** Cycles through a category's response variants instead of repeating the same one. */
function pickVariant(state: CoachState, id: string, variants: string[]): { text: string; state: CoachState } {
  const count = state.categoryUseCount[id] ?? 0;
  const text = variants[count % variants.length];
  return { text, state: { ...state, categoryUseCount: { ...state.categoryUseCount, [id]: count + 1 } } };
}

// ---------------------------------------------------------------------
// Verbatim scripted lines (from the coach's defined conversational flows)
// ---------------------------------------------------------------------

const FLOW_TEXT = {
  analyzeOpener:
    "Let's start with the foundation. What type of business do you own, where do you operate, and what is the biggest challenge you are trying to solve right now?",
  growthPlanOpener:
    "We'll build a plan based on your real capacity, not an unrealistic wish list. What is the most important result you want within 90 days, and how many hours per week can you consistently invest?",
  websiteReviewOpener:
    "I can guide you through a structured website assessment. This demonstration does not perform a live technical scan yet, but I can help you evaluate your messaging, mobile experience, calls-to-action, trust signals, SEO foundation, and lead-capture process.",
} as const;

// ---------------------------------------------------------------------
// Prompt-card entry points (deterministic — triggered by clicking a
// suggested-prompt card, unaffected by the free-text intent engine below)
// ---------------------------------------------------------------------

function enterAssessment(state: CoachState) {
  return {
    state: { ...clearFlow(state), flow: "assessment" as const },
    message: assistantMessage(FLOW_TEXT.analyzeOpener, { mode: "clarity" }),
  };
}

function enterGrowthPlan(state: CoachState) {
  return {
    state: { ...clearFlow(state), flow: "growth-plan" as const },
    message: assistantMessage(FLOW_TEXT.growthPlanOpener, { mode: "strategy" }),
  };
}

function enterWebsiteReview(state: CoachState) {
  return {
    state: { ...clearFlow(state), flow: "website-review" as const },
    message: assistantMessage(FLOW_TEXT.websiteReviewOpener, { mode: "clarity" }),
  };
}

// ---------------------------------------------------------------------
// Next Level Growth Score — Quick Check / Full Assessment
// ---------------------------------------------------------------------

/** `remainingIncludingCurrent` counts the question being asked now plus everything still queued after it. */
function buildScoreQuestionPrompt(questionId: string, answeredCount: number, remainingIncludingCurrent: number): GrowthScoreQuestionPrompt {
  const question = getQuestionById(questionId);
  if (!question) throw new Error(`Unknown Growth Score question id: ${questionId}`);
  return {
    questionId: question.id,
    options: [
      ...question.options.map((o) => ({ value: o.value, label: o.label })),
      { value: "unknown", label: "I don't know" },
      { value: "not-applicable", label: "Not applicable" },
    ],
    progress: { answered: answeredCount, total: answeredCount + remainingIncludingCurrent },
  };
}

function startGrowthAssessment(state: CoachState, mode: "quick" | "full") {
  const queue = buildQuestionQueue(mode);
  const firstQuestionId = queue[0];
  const question = getQuestionById(firstQuestionId);
  const nextState: CoachState = {
    ...clearFlow(state),
    growthAssessment: { mode, questionQueue: queue.slice(1), currentQuestionId: firstQuestionId, answers: [], completed: false },
  };
  const intro = mode === "quick" ? growthScoreIntro.quick : growthScoreIntro.full;
  return {
    state: nextState,
    message: assistantMessage(`${intro}\n\n${question?.prompt ?? ""}`, {
      mode: "performance",
      scoreQuestion: buildScoreQuestionPrompt(firstQuestionId, 0, queue.length),
    }),
  };
}

function buildScoreResultsSummary(result: GrowthScoreResult): string {
  if (result.overallScore === null) {
    const early = [
      result.topStrengths[0] ? `Early strength: ${result.topStrengths[0].what}` : null,
      result.topWeaknesses[0] ? `Early gap: ${result.topWeaknesses[0].what}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    return `I have enough information to identify early strengths and growth gaps, but not enough to calculate a reliable full Growth Score yet.\n\n${early}\n\n${result.confidenceExplanation}`.trim();
  }
  const band = result.scoreBand;
  const lines = [
    `Your Next Level Growth Score: **${result.overallScore}/100** (${band?.label}).`,
    band?.message ?? "",
    result.topStrengths[0] ? `Strongest area: ${result.topStrengths[0].what}` : null,
    result.topWeaknesses[0] ? `Biggest gap: ${result.topWeaknesses[0].what}` : null,
    `Next move: ${result.immediateNextAction}`,
  ].filter(Boolean);
  return lines.join("\n\n");
}

function finishGrowthAssessment(state: CoachState, answers: GrowthScoreAnswer[]) {
  const mode = state.growthAssessment!.mode;
  const result = calculateGrowthScore(mode, answers);
  const clearedState: CoachState = {
    ...state,
    growthAssessment: null,
    lastGrowthScore: result,
    context: { ...state.context, currentPriority: result.highestPriorityGap ?? state.context.currentPriority },
  };

  const summary = buildScoreResultsSummary(result);

  if (mode === "quick") {
    return {
      state: clearedState,
      message: assistantMessage(summary, {
        mode: "performance",
        growthScoreResult: result,
        quickReplies: [{ label: "Take the Full Assessment", action: "start-full-assessment" }],
      }),
    };
  }

  const businessReport = buildBusinessGrowthReportFromScore(result, clearedState.context);
  const stateWithReport: CoachState = { ...clearedState, businessReport };
  return withReportOffer(stateWithReport, assistantMessage(summary, { mode: "performance", growthScoreResult: result }), businessReport);
}

function advanceGrowthAssessment(state: CoachState, promptId: string) {
  const assessment = state.growthAssessment;
  if (!assessment) {
    return { state, message: assistantMessage("Let's start that assessment again from the beginning.", { mode: "clarity" }) };
  }

  const [, questionId, value] = promptId.split(":");
  const question = getQuestionById(questionId);
  if (!question || question.id !== assessment.currentQuestionId) {
    return { state, message: assistantMessage("That question isn't active anymore. Let's continue with the current one.", { mode: "clarity" }) };
  }

  const answer = recordAnswer(question, value);
  const answers = [...assessment.answers, answer];
  const queue = assessment.questionQueue;

  if (queue.length === 0) {
    const finalState: CoachState = { ...state, growthAssessment: { ...assessment, answers, completed: true } };
    return finishGrowthAssessment(finalState, answers);
  }

  const nextQuestionId = queue[0];
  const nextQuestion = getQuestionById(nextQuestionId);
  const nextState: CoachState = {
    ...state,
    growthAssessment: { ...assessment, answers, questionQueue: queue.slice(1), currentQuestionId: nextQuestionId },
  };
  return {
    state: nextState,
    message: assistantMessage(nextQuestion?.prompt ?? "", {
      mode: "performance",
      scoreQuestion: buildScoreQuestionPrompt(nextQuestionId, answers.length, queue.length),
    }),
  };
}

const TOPIC_OPENERS: Record<
  Exclude<CoachState["topic"], null>,
  { content: string; mode: CoachMessage["mode"] }
> = {
  leads: {
    content:
      "Before recommending a channel, I need to understand your current system. How do new customers find you today, approximately how many leads do you receive each month, and what happens after someone contacts you?",
    mode: "strategy",
  },
  "google-visibility": {
    content:
      "Let's look at how discoverable you actually are. Is your Google Business Profile claimed and fully filled out, and roughly how many reviews do you have today?",
    mode: "strategy",
  },
  marketing: {
    content:
      "Marketing only works when it's aimed at something specific. What are you currently doing to stay in front of customers, and which of those efforts do you actually track the results of?",
    mode: "strategy",
  },
  systems: {
    content:
      "Let's find where things fall through the cracks. Walk me through what happens, step by step, from the moment a customer reaches out to the moment the job or sale is complete.",
    mode: "performance",
  },
  automation: {
    content:
      "Automation should remove friction, not add complexity. Where are you or your team spending repetitive time today: following up, scheduling, answering the same questions?",
    mode: "strategy",
  },
  prioritize: {
    content:
      "Let's get this out of your head and onto paper. List the three to five things competing for your attention right now, one per line.",
    mode: "clarity",
  },
  challenge: {
    content:
      "Let's name it directly. What have you been putting off, and what's the reason you've been telling yourself for why it hasn't happened yet?",
    mode: "challenge",
  },
};

function enterTopic(state: CoachState, topic: Exclude<CoachState["topic"], null>) {
  const opener = TOPIC_OPENERS[topic];
  return {
    state: { ...clearFlow(state), topic },
    message: assistantMessage(opener.content, { mode: opener.mode }),
  };
}

const PROMPT_HANDLERS: Record<string, (state: CoachState) => { state: CoachState; message: CoachMessage }> = {
  analyze: enterAssessment,
  "growth-plan": enterGrowthPlan,
  "website-review": enterWebsiteReview,
  "growth-score-quick": (state) => startGrowthAssessment(state, "quick"),
  "growth-score-full": (state) => startGrowthAssessment(state, "full"),
  "start-full-assessment": (state) => startGrowthAssessment(state, "full"),
  leads: (state) => enterTopic(state, "leads"),
  "google-visibility": (state) => enterTopic(state, "google-visibility"),
  marketing: (state) => enterTopic(state, "marketing"),
  systems: (state) => enterTopic(state, "systems"),
  automation: (state) => enterTopic(state, "automation"),
  prioritize: (state) => enterTopic(state, "prioritize"),
  challenge: (state) => enterTopic(state, "challenge"),
  "consult-yes": (state) => ({
    state,
    message: assistantMessage(
      "Good call. A short, no-pressure conversation is the fastest way to turn this into a real plan with us.",
      { mode: "execution", cta: { label: primaryCta.label, href: primaryCta.href } }
    ),
  }),
  "consult-no": (state) => ({
    state,
    message: assistantMessage(consultDeclineReply, { mode: "clarity" }),
  }),
  "report-yes": (state) => {
    if (!state.businessReport) {
      return { state, message: assistantMessage("Let's finish the assessment first so I have enough to build a real report from.", { mode: "clarity" }) };
    }
    return {
      state,
      message: assistantMessage("Here's your personalized Business Growth Report.", { mode: "strategy", businessReport: state.businessReport }),
    };
  },
  "report-not-now": (state) => ({
    state,
    message: assistantMessage("No problem. We can always put this together later. Let's keep going.", { mode: "clarity" }),
  }),
};

// ---------------------------------------------------------------------
// Topic follow-ups (one reply, then back to open routing)
// ---------------------------------------------------------------------

function handleTopicFollowup(state: CoachState, userText: string) {
  const topic = state.topic;
  const cleared = clearFlow(state);

  if (topic === "prioritize") {
    const report = buildPriorityReport(userText);
    return withConsultOffer(
      cleared,
      assistantMessage("Here's a first pass at sorting that list. Adjust anything that doesn't feel right. You know your business better than any framework does.", {
        mode: "execution",
        report,
      })
    );
  }

  // Escape hatch: a real conversation doesn't always answer the question it
  // was just asked — if this message scores strongly on a different, more
  // specific intent, honor that instead of forcing it into the topic's
  // single follow-up slot (e.g. answering "leads" with an unrelated
  // pricing question shouldn't get treated as a leads follow-up).
  const strongerMatch = INTENT_ROUTES.map((def) => ({ def, score: scoreIntent(def, userText) }))
    .filter((entry) => entry.score >= 3)
    .sort((a, b) => b.score - a.score)[0];
  if (strongerMatch) return strongerMatch.def.handle(cleared, userText);

  const copy = TOPIC_FOLLOWUPS[topic as Exclude<CoachState["topic"], null | "prioritize">];
  if (!copy) return routeFreeText(cleared, userText);
  return { state: cleared, message: assistantMessage(copy.content, { mode: copy.mode }) };
}

const TOPIC_FOLLOWUPS: Partial<Record<Exclude<CoachState["topic"], null>, { content: string; mode: CoachMessage["mode"] }>> = {
  leads: {
    mode: "strategy",
    content:
      "Here's what stands out: the channel bringing you customers matters less right now than what happens in the first few minutes after they reach out. Most businesses lose leads to slow response time, not weak marketing. **The recommendation:** before spending more to generate leads, tighten your response process: aim to reply within the first hour, every time, even if it's a short holding message. Once that's solid, we can talk about adding a channel. What does your response time actually look like today?",
  },
  "google-visibility": {
    mode: "strategy",
    content:
      "Your Google Business Profile is often the first real impression a local customer gets, often before your website. **The recommendation:** claim and completely fill out your profile (hours, photos, services, service area), then build a simple, consistent habit of asking every satisfied customer for a review. Volume and recency both matter more than most owners expect. Do you have a process today for asking customers to leave a review, or does it happen only when someone remembers?",
  },
  marketing: {
    mode: "strategy",
    content:
      "Untracked marketing feels like progress but doesn't tell you what to do next. **The recommendation:** before adding a new channel, pick the one or two efforts you're already running and set up a simple way to know if they're working, even a basic \"how did you hear about us\" habit counts. Consistency on fewer channels beats scattered effort across many. Which single marketing effort would you most want to know is actually paying off?",
  },
  systems: {
    mode: "performance",
    content:
      "That walk-through usually reveals it: the gap is rarely effort, it's handoffs: the moments where something depends on someone remembering instead of a process catching it. **The recommendation:** pick the single handoff most likely to drop a customer or a task, and write down the three steps that should always happen there. That's the start of your first real SOP. Where in that process are you most likely to lose something if you're not personally watching it?",
  },
  automation: {
    mode: "strategy",
    content:
      "Repetitive, predictable tasks (follow-ups, scheduling, answering the same handful of questions) are exactly what automation should absorb first. **The recommendation:** start with one workflow, not five. Automating a single high-friction step well builds trust in the system and gives you a template for the next one. Of the repetitive tasks you mentioned, which one would free up the most time if it simply handled itself?",
  },
  challenge: {
    mode: "challenge",
    content:
      "That reason is worth examining honestly, but it's not a wall. It's a story, and stories can be rewritten. Waiting for the perfect moment, more certainty, or more time rarely arrives on its own. **The commitment:** pick the smallest version of that task you can complete in the next 24 hours, and do that one thing before you do anything else on your list. What's the smallest version of it you could realistically finish today?",
  },
};

// ---------------------------------------------------------------------
// Flow step machines (assessment / growth-plan / website-review)
// ---------------------------------------------------------------------

function advanceFlow(state: CoachState, userText: string) {
  const answers = [...state.answers, userText];

  if (state.flow === "assessment") {
    if (state.step === 0) {
      return {
        state: { ...state, step: 1, answers },
        message: assistantMessage(
          "Good. That gives me a starting picture. Now, how do customers currently find you, and do you already have a website and a Google Business Profile in place?",
          { mode: "clarity" }
        ),
      };
    }
    if (state.step === 1) {
      return {
        state: { ...state, step: 2, answers },
        message: assistantMessage(
          "One more thing before I put this together: what are you trying to accomplish over the next 90 days, and roughly how many hours a week can you realistically dedicate to it?",
          { mode: "clarity" }
        ),
      };
    }
    const report = buildAssessmentReport(answers);
    const priorityKey = detectPriority(answers.join(" "));
    const nextState: CoachState = {
      ...clearFlow(state),
      context: {
        ...state.context,
        business: state.context.business ?? answers[0]?.slice(0, 80) ?? null,
        primaryGoal: state.context.primaryGoal ?? answers[2]?.slice(0, 80) ?? null,
        currentPriority: PRIORITY_CONTENT[priorityKey].headline,
      },
    };
    const businessReport = buildBusinessGrowthReport({ sourceFlow: "assessment", priorityKey, answers, context: nextState.context });
    return withReportOffer(nextState, assistantMessage("Here's where things stand, and where I'd start.", { mode: "strategy", report }), businessReport);
  }

  if (state.flow === "growth-plan") {
    if (state.step === 0) {
      return {
        state: { ...state, step: 1, answers },
        message: assistantMessage(
          "Good. Now let's account for reality. What's your budget situation, and what's the single biggest constraint standing between you and that result: time, money, team, or something else?",
          { mode: "strategy" }
        ),
      };
    }
    const report = buildGrowthPlanReport(answers);
    const nextState: CoachState = {
      ...clearFlow(state),
      context: { ...state.context, primaryGoal: state.context.primaryGoal ?? answers[0]?.slice(0, 80) ?? null },
    };
    const priorityKey = detectPriority(answers.join(" "));
    const businessReport = buildBusinessGrowthReport({ sourceFlow: "growth-plan", priorityKey, answers, context: nextState.context });
    return withReportOffer(
      nextState,
      assistantMessage("Here's a 90-day plan sized to what you actually have to work with.", { mode: "execution", report }),
      businessReport
    );
  }

  if (state.flow === "website-review") {
    if (state.step === 0) {
      return {
        state: { ...state, step: 1, answers },
        message: assistantMessage(
          "Let's make this concrete. What's the website's URL, or if you'd rather just describe it: what does it currently do well, and where do visitors seem to lose momentum or leave?",
          { mode: "clarity" }
        ),
      };
    }
    const report = buildWebsiteReviewReport(answers);
    const clearedState = clearFlow(state);
    const businessReport = buildBusinessGrowthReport({ sourceFlow: "website-review", priorityKey: "website", answers, context: clearedState.context });
    return withReportOffer(
      clearedState,
      assistantMessage("Here's a demonstration review based on what you've shared. A real scan would go deeper, but this shows the kind of thinking we'd apply.", {
        mode: "strategy",
        report,
      }),
      businessReport
    );
  }

  return routeFreeText(clearFlow(state), userText);
}

// ---------------------------------------------------------------------
// Report builders
// ---------------------------------------------------------------------

function quote(text: string, max = 160) {
  const trimmed = text.trim();
  const clipped = trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
  return `"${clipped}"`;
}

type PriorityKey = "website" | "leads" | "visibility";

function detectPriority(combinedText: string): PriorityKey {
  const text = combinedText.toLowerCase();
  if (/website|landing page|no site|outdated site/.test(text)) return "website";
  if (/lead|follow.?up|respond|inquir/.test(text)) return "leads";
  return "visibility";
}

const PRIORITY_CONTENT: Record<
  PriorityKey,
  { headline: string; quickWins: string[]; next30: string[]; next60to90: string[]; metrics: string[]; nextMove: string }
> = {
  website: {
    headline:
      "Your website is the biggest lever right now. It's the one asset every other effort (ads, reviews, referrals) eventually sends people back to, so weaknesses there quietly cap the return on everything else.",
    quickWins: [
      "Make sure your phone number, service area, and one clear call-to-action appear above the fold on mobile.",
      "Add or tighten a single, specific headline that says exactly who you help and how.",
      "Confirm every contact method (form, phone, click-to-call) actually works on a phone.",
    ],
    next30: [
      "Audit every page for one clear next step. No page should leave a visitor unsure what to do.",
      "Rewrite the homepage headline and opening section around the outcome customers want, not just your services list.",
      "Add trust signals: reviews, credentials, or before/after proof, placed near your calls-to-action.",
    ],
    next60to90: [
      "Build or improve dedicated pages for your highest-value services.",
      "Set up basic analytics so you can see which pages actually drive contact form submissions or calls.",
      "Test and improve page load speed on mobile.",
    ],
    metrics: ["Website visits", "Contact form submissions / calls from the site", "Visitor-to-lead conversion rate"],
    nextMove: "Pick one page, most likely your homepage, and rewrite its headline and call-to-action this week. Nothing else on the list matters until that's done.",
  },
  leads: {
    headline:
      "Your biggest gap isn't attention. It's what happens after someone reaches out. A slow or inconsistent response is quietly costing you customers you already earned the right to win.",
    quickWins: [
      "Set a standard: every inquiry gets a reply within one business hour, even if it's just to confirm you received it.",
      "Create one saved response template so a fast reply doesn't depend on finding time to write one from scratch.",
      "Add a simple log, even a spreadsheet, so no inquiry silently falls through the cracks.",
    ],
    next30: [
      "Track response time for every new lead for two full weeks to see your real baseline.",
      "Build a short, consistent follow-up sequence for leads who don't respond to the first message.",
      "Identify your single best-performing lead source and double down before adding new ones.",
    ],
    next60to90: [
      "Introduce a simple CRM or shared tracker so lead status is visible to everyone involved.",
      "Test one new lead-generation channel, but only after your response process is consistent.",
      "Review win/loss patterns: where are qualified leads actually being lost?",
    ],
    metrics: ["Average first-response time", "Leads contacted vs. leads that go quiet", "Lead-to-customer conversion rate"],
    nextMove: "Today, write the one-hour response standard down and tell whoever answers inquiries that it's now the rule, not an aspiration.",
  },
  visibility: {
    headline:
      "Your foundation is workable, but you're likely leaving visibility on the table. The customers actively searching for what you offer aren't finding you as easily as they could.",
    quickWins: [
      "Fully complete your Google Business Profile: hours, categories, service area, and recent photos.",
      "Ask your next five satisfied customers directly for a review, in the moment, not after the fact.",
      "Make sure your business name, address, and phone number match exactly everywhere they're listed online.",
    ],
    next30: [
      "Build a simple, repeatable habit for requesting reviews after every completed job or sale.",
      "Add or update location- and service-specific content so you show up for what customers actually search.",
      "Respond publicly to every review, positive or negative. It signals an active, trustworthy business.",
    ],
    next60to90: [
      "Expand content to cover your most common customer questions.",
      "Look for one or two relevant local partnerships or listings to strengthen credibility.",
      "Revisit your service pages with what you've learned about what customers actually ask for.",
    ],
    metrics: ["Google Business Profile views and calls", "Review count and average rating", "Search visibility for your core service terms"],
    nextMove: "Claim and fully complete your Google Business Profile this week if you haven't. It's the fastest-moving lever available to you.",
  },
};

function buildAssessmentReport(answers: string[]): StructuredReport {
  const [foundation = "", discovery = "", goal = ""] = answers;
  const priority = detectPriority(`${foundation} ${discovery} ${goal}`);
  const content = PRIORITY_CONTENT[priority];

  return {
    title: "Business Assessment",
    sections: [
      { heading: "Current State", body: `Based on what you shared: ${quote(foundation)}` },
      {
        heading: "Ideal State",
        body: `A business where ${goal ? quote(goal) : "your 90-day goal"} is not just possible but on a clear track, with a system in place instead of relying on memory or hustle alone.`,
      },
      {
        heading: "The Gap",
        body: `Right now, customer discovery looks like this: ${quote(discovery)}. That's the raw material. The gap is turning it into a consistent, trackable system rather than something that happens inconsistently.`,
      },
      { heading: "Top Priority", body: content.headline },
      { heading: "Quick Wins", body: content.quickWins },
      { heading: "30-Day Plan", body: content.next30 },
      { heading: "90-Day Roadmap", body: content.next60to90 },
      { heading: "Key Metrics", body: content.metrics },
      { heading: "Next Move", body: content.nextMove },
    ],
  };
}

function buildGrowthPlanReport(answers: string[]): StructuredReport {
  const [goalAndHours = "", constraint = ""] = answers;
  const hours = extractHours(goalAndHours);
  const lean = hours !== null && hours <= 5;

  const first30 = lean
    ? ["Pick the one highest-leverage action from this plan and protect a fixed weekly block for it.", "Remove or pause anything on your plate that isn't moving this specific goal forward."]
    : ["Establish the foundation: clarify the offer, message, and the one metric you're improving.", "Fix the highest-friction step between a new lead and a paying customer.", "Set up simple tracking so progress is visible, not assumed."];

  const days31to60 = lean
    ? ["Build one repeatable weekly habit around the priority action, same time, same standard, every week."]
    : ["Expand the one channel or system that showed the earliest signal of working.", "Introduce a lightweight weekly review to check progress against the goal.", "Address the second-highest friction point in the customer journey."];

  const days61to90 = lean
    ? ["Review results against the original goal and decide what earns more of your limited time next quarter."]
    : ["Scale what's working; retire or fix what isn't.", "Document the process so it doesn't depend entirely on you.", "Set the next 90-day goal based on real data instead of a guess."];

  return {
    title: "90-Day Growth Plan",
    sections: [
      { heading: "Primary Goal", body: quote(goalAndHours) },
      { heading: "Current Baseline", body: "Whatever is happening today is the baseline. We'll compare every result back to this starting point, not to a guess." },
      { heading: "Main Constraint", body: quote(constraint) },
      { heading: "Weekly Time Available", body: hours !== null ? `${hours} hours per week` : goalAndHours },
      {
        heading: "Budget Considerations",
        body: /budget|money|cost|afford/i.test(constraint)
          ? "Budget is a real factor here. The plan below is weighted toward actions that cost time and discipline more than dollars."
          : "No major budget constraint noted. The plan still starts lean, because consistent execution matters more than spend.",
      },
      { heading: "First 30 Days", body: first30 },
      { heading: "Days 31–60", body: days31to60 },
      { heading: "Days 61–90", body: days61to90 },
      { heading: "Metrics", body: ["The one metric tied directly to your stated goal", "Weekly time actually invested vs. planned"] },
      {
        heading: "Risks",
        body: lean
          ? "With limited hours, the biggest risk is spreading effort too thin. This plan intentionally does less, not more."
          : "The biggest risk is losing focus mid-plan. Protect the weekly review. It's what keeps this a plan instead of a wish list.",
      },
      {
        heading: "Next Action",
        body: lean
          ? "Block one recurring time slot this week for the priority action. Even 90 focused minutes beats scattered attention."
          : "Block time this week to fix the highest-friction step in your customer journey. That's where the plan starts.",
      },
    ],
  };
}

function buildWebsiteReviewReport(answers: string[]): StructuredReport {
  const [, detail = ""] = answers;
  const mentionsMobile = /mobile|phone/i.test(detail);
  const mentionsSlow = /slow|speed|loading/i.test(detail);
  const mentionsUnclear = /confus|unclear|too much|don'?t know what/i.test(detail);

  const weakness = mentionsMobile
    ? "The mobile experience is the likely weak point. That's where most local customers will actually meet your business first."
    : mentionsSlow
      ? "Page speed appears to be working against you. Every extra second of load time quietly costs conversions."
      : mentionsUnclear
        ? "Messaging clarity looks like the weak point. Visitors may not immediately understand what to do next."
        : "Without a live scan, the most common weak point at this stage is a missing or buried call-to-action, worth checking first.";

  return {
    title: "Website Review: Demonstration",
    demo: true,
    scoreLabel: "6.5 / 10 (demo score, not a live scan)",
    sections: [
      { heading: "Strongest Area", body: "Based on what you've described, the foundation sounds workable. This is about sharpening what exists, not starting over." },
      { heading: "Biggest Weakness", body: weakness },
      { heading: "Highest-Priority Improvement", body: "Get one clear, unmissable call-to-action above the fold on both desktop and mobile: a phone number, a form, or a single obvious next step." },
      {
        heading: "Quick Wins",
        body: [
          "Confirm your phone number and primary call-to-action are visible without scrolling on a phone.",
          "Add or strengthen a trust signal near your main call-to-action (reviews, credentials, guarantees).",
          "Make sure every service you offer is named clearly, not buried in general language.",
        ],
      },
      {
        heading: "Longer-Term Recommendations",
        body: "Once the immediate gaps are addressed, a full technical and SEO review would look at page speed, structured data, and content depth. That's where a real scan (Phase 2 of this tool) would go further than this demonstration can.",
      },
    ],
  };
}

function buildPriorityReport(userText: string): StructuredReport {
  const items = userText
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  const buckets: Record<string, string[]> = { "Do Now": [], "Do Next": [], "Do Later": [], "Not Yet": [] };
  const order = ["Do Now", "Do Next", "Do Later", "Not Yet"];
  items.forEach((item, index) => {
    buckets[order[index % order.length]].push(item);
  });

  return {
    title: "Priority Sort",
    sections: [
      { heading: "Do Now", body: buckets["Do Now"].length ? buckets["Do Now"] : "Nothing landed here yet." },
      { heading: "Do Next", body: buckets["Do Next"].length ? buckets["Do Next"] : "Nothing landed here yet." },
      { heading: "Do Later", body: buckets["Do Later"].length ? buckets["Do Later"] : "Nothing landed here yet." },
      { heading: "Do Not Prioritize Yet", body: buckets["Not Yet"].length ? buckets["Not Yet"] : "Nothing landed here yet." },
      {
        heading: "How to Use This",
        body: "This is a starting sort, not a verdict. The real answer depends on impact, urgency, effort, and cost, and only you have full visibility into those. Move anything that feels wrong; the goal is a shorter list, not a perfect one.",
      },
    ],
  };
}

// =======================================================================
// FREE-TEXT INTENT ENGINE
// ------------------------------------------------------------------
// Replaces a flat keyword-list + single generic fallback with weighted,
// multi-category scoring: every message is scored against every intent
// (business AND emotional), the strongest match answers, and — critically
// — several of the most emotionally-loaded intents carry more than one
// response variant so the same message never produces the same reply
// twice in a row. Nothing here calls out to a model; it's pattern
// matching, kept in one place so Phase 2 can swap it for a real call.
// =======================================================================

type IntentDef = {
  id: string;
  mode: CoachingMode;
  keywords: Array<{ re: RegExp; weight: number }>;
  handle: (state: CoachState, text: string) => { state: CoachState; message: CoachMessage };
};

function scoreIntent(def: IntentDef, text: string): number {
  return def.keywords.reduce((sum, k) => sum + (k.re.test(text) ? k.weight : 0), 0);
}

/** A stateless, single-turn category: pick a variant, reply, optionally record something to context. */
function statelessCategory(
  id: string,
  mode: CoachingMode,
  variants: string[],
  contextPatch?: (state: CoachState, text: string) => Partial<CoachContext>
) {
  return (state: CoachState, text: string) => {
    const { text: reply, state: usedState } = pickVariant(state, id, variants);
    const patch = contextPatch ? contextPatch(usedState, text) : {};
    const nextState: CoachState = { ...clearFlow(usedState), context: { ...usedState.context, ...patch } };
    return { state: nextState, message: assistantMessage(reply, { mode }) };
  };
}

const captureFear = (state: CoachState, text: string): Partial<CoachContext> => ({ mainFear: text.trim().slice(0, 140) });
const capturePriority = (state: CoachState, text: string): Partial<CoachContext> => ({ currentPriority: text.trim().slice(0, 140) });

// --- New, emotionally- and situationally-aware categories ---------------

const FEAR_OF_FAILURE_VARIANTS = [
  "That fear makes sense. You are putting time, identity, and hope into something that does not come with a guaranteed outcome.\n\nBut fear becomes dangerous when it stays vague. \"Failing\" could mean losing money, not getting clients, disappointing your family, or proving a fear you already carry about yourself.\n\nVague fear is hard to act on, so let's make it specific.\n\nWhat specifically would failure look like to you, and what is the smallest test we could run that would give you real information without risking everything?",
  "Fear like that usually means the stakes are real, not that the plan is wrong. It's worth taking seriously rather than pushing away.\n\nHere's the shift: instead of asking \"what if this fails,\" ask \"what would I actually lose, and could I recover from it.\" Most fears are bigger in the imagination than on paper.\n\nCourage does not require certainty. It requires a next step small enough to take anyway.\n\nWhat's the one action you'd take this week if you knew you could handle the worst realistic outcome?",
];

const SELF_DOUBT_VARIANTS = [
  "That thought, the one telling you that you can't do this, deserves a closer look before you accept it as true.\n\nSelf-doubt usually isn't about your actual capability. It's about the gap between where you are and where you're trying to go, and that gap always feels bigger from the middle of it.\n\nA setback is data, not identity. It tells you what to adjust, not who you are.\n\nWhat's one piece of evidence, something you've already done, that contradicts the story that you can't do this?",
];

const OVERWHELM_VARIANTS = [
  "Overwhelm usually does not mean you have no options. It means too many things are competing for equal importance.\n\nWe are going to reduce the noise.\n\nGive me the three biggest things demanding your attention right now. I'll help you separate what is urgent, what actually creates growth, and what can wait.",
  "When everything feels equally urgent, nothing actually is. That's usually the real problem, not a lack of time or effort.\n\nYou don't need to work harder yet. You need one clear next step, chosen deliberately instead of whatever is loudest.\n\nWhat are the three things pulling at your attention most right now, in the order they came to mind?",
];

const LACK_OF_DIRECTION_VARIANTS = [
  "Not knowing what to focus on is its own kind of signal. It usually means you have several reasonable options and no clear filter for choosing between them yet.\n\nHere's the filter: of everything on your plate, which one thing, if it moved forward today, would actually change your business's trajectory, not just make you feel productive?\n\nWhat's the one task that fits that description?",
];

const WORK_LIFE_BALANCE_VARIANTS = [
  "Then the goal is not to squeeze more activity into an already full life. The goal is to design a life where the business supports what matters instead of consuming it.\n\nWork, family time, health, and happiness are not automatically competing goals. They become competitors when your calendar has no priorities or boundaries.\n\nLet's design this from the outcome backward.\n\nIn an ideal normal week, how many hours would you work, and what would you protect for family, health, and recovery?",
  "A business that costs you your health, your family, or your happiness isn't actually a success, no matter what the revenue says. That's worth saying plainly.\n\nSustainable ambition means building boundaries into the plan, not hoping they show up once things calm down. They rarely do on their own.\n\nWhat's one boundary, a specific day, hour, or commitment, you'd protect this week even if the business pushed against it?",
];

const BURNOUT_VARIANTS = [
  "Exhaustion is information, not weakness. It's telling you the current pace isn't sustainable, and that's worth listening to before it makes the decision for you.\n\nHigh standards matter, but discipline without limits eventually destroys the thing it was meant to build.\n\nBefore we talk strategy, what's driving the exhaustion most right now: the volume of work, the uncertainty, or the feeling that it never stops?",
];

const MOTIVATION_VARIANTS = [
  "You do not need a temporary burst of motivation. You need a clear reason, a manageable next action, and the discipline to complete it.\n\nTell me what you have been avoiding, and we'll turn it into a step you can execute today.",
  "Motivation that has to be manufactured every morning is unreliable by nature. The businesses that hold up are built on a clear reason plus a repeatable next step, not a feeling.\n\nWhat's the actual reason you started this (not the pitch version, the real one), and what's one action today that reason would justify?",
];

const AVOIDANCE_VARIANTS = [
  "Then your planning has stopped being preparation and started becoming protection.\n\nYou may be using more research to avoid the moment where the idea gets tested in the real world.\n\nWe do not need a bigger plan right now. We need one completed action.\n\nWhat is the task you already know you should do but keep postponing?",
  "Being busy does not always mean the right work is moving forward. Effort and progress are not the same thing, and it's easy to confuse them.\n\nThe plan will improve once it meets reality, so acting on an imperfect version beats refining one that never leaves the page.\n\nWhat goal are you pursuing, what have you actually done toward it this week, and which result still hasn't moved?",
];

const FINANCIAL_PRESSURE_VARIANTS = [
  "Money tightness has a way of making every decision feel urgent, which is exactly when it's easiest to make the wrong one.\n\nThe question isn't \"how do I get more money,\" it's \"what's the fastest, lowest-cost path to your first (or next) paying customer using only what you already have.\"\n\nWhat could you sell or deliver this week without spending anything you don't already have?",
];

const SPENDING_DECISION_VARIANTS = [
  "Debt, or any significant spend, can accelerate a system that already works. It can also magnify a business model that hasn't been proven yet.\n\nBefore committing money, get clear on four things: what exactly it buys, how that purchase is expected to create revenue, how the payment gets covered if growth is slower than expected, and whether a smaller, self-funded test could prove the idea first.\n\nWhat are you considering spending on, and has that specific investment already produced measurable results at a smaller scale?",
  "Spending to grow only makes sense once you know exactly what you're buying (attention, leads, or time) and how you'll know it worked.\n\nBefore you commit budget: what specific result is this spend supposed to produce, by when will you know if it's working, and what's the smallest version you could test before scaling it up?\n\nWhat result are you hoping this spend produces, and how would you measure it in the first 30 days?",
];

const PRICING_VARIANTS = [
  "Underpricing is one of the most common ways a good business quietly stays small. It feels safe, but it actually raises risk by leaving no margin for mistakes, slow months, or growth.\n\nStart from cost and required margin, not from what feels comfortable to say out loud. Price for the business you're building, not just the one sale in front of you.\n\nWhat does it actually cost you in time and materials to deliver your core offer, and what margin would you need to reinvest and grow?",
];

const TEAM_LEADERSHIP_VARIANTS = [
  "Underperformance is rarely just a motivation problem. It's usually a clarity problem: unclear expectations, missing feedback, or a process that depends on memory instead of a standard.\n\nBeing direct about the gap, while staying focused on the fix rather than the fault, holds people accountable without making it personal.\n\nWhere specifically is performance falling short: the quality of the work, the consistency, or the follow-through? And have you told them clearly what \"good\" looks like?",
];

const DIFFICULT_DECISION_VARIANTS = [
  "A decision that size deserves more than a gut check, and it's reasonable that it feels heavy.\n\nReframe the question from \"should I\" to \"what would have to be true first.\" That turns an emotional binary into a readiness checklist you can actually evaluate.\n\nOne useful test: are you moving toward something you've built real evidence for, or away from something that's simply become uncomfortable? Both are valid, but they call for different plans.\n\nWhat evidence do you already have that this path can support what you need it to?",
];

const NEW_BUSINESS_IDEA_VARIANTS = [
  "New ideas are common for entrepreneurial minds. The real question isn't which idea is best. It's which one deserves your finite time right now.\n\nBefore starting anything new: does the current business have real traction, or is the new idea more exciting simply because it's unproven? Chasing new ideas can be productive distraction from the harder, less glamorous work of pushing what you already have further.\n\nHas this new idea been tested with a single real potential customer yet, or is it still a hunch?",
];

const INCOME_GOAL_VARIANTS = [
  "A number like that is a strong target, but it stays abstract until it's broken into something you can act on this week.\n\nTry reverse-engineering it: divide the goal by 12 months, then by your average sale value, and you get a concrete number of customers per month, a far more useful target than the headline figure.\n\nWhat's the average value of a customer to your business right now?",
];

const REVENUE_STALL_VARIANTS = [
  "A plateau usually has one of three causes: not enough people know you exist, the people who find you aren't converting, or the customers you do get aren't coming back.\n\nEach one has a completely different fix, so guessing wastes time.\n\nOf those three, which one sounds most like what's actually happening in your business right now?",
];

const BUSINESS_SETBACK_VARIANTS = [
  "That's a real loss, and it's worth acknowledging before we move past it. What happened is information about a decision or a system, not a verdict on your ability to run this business.\n\nThe goal now isn't to relitigate the mistake. It's to extract the one lesson that changes what happens next time.\n\nWhat specifically led to it, and what would you do differently if the same situation came up again next month?",
];

const DELEGATION_VARIANTS = [
  "Holding onto everything yourself feels safer, but it quietly caps how big the business can get. Your time is the one resource that can't be multiplied without help.\n\nStart with the task you're doing that someone else could do at 80% of your quality for a fraction of your hourly value. That gap is where delegation pays off fastest, not perfection.\n\nWhat's the one recurring task you keep doing yourself that someone else could learn this month?",
];

const SCALING_STRATEGY_VARIANTS = [
  "Scaling isn't \"more of everything.\" It's proving that what already works can hold up under more volume without you personally holding it together.\n\nThe businesses that scale well documented their process before they needed to, not after it broke.\n\nWhat part of your current operation would break first if your customer volume doubled tomorrow?",
];

// --- Intent routing table (structural entries reuse existing handlers) --

const INTENT_ROUTES: IntentDef[] = [
  // Emotional / mindset
  {
    id: "fear-of-failure",
    mode: "encouragement",
    keywords: [
      { re: /\bafraid\b/i, weight: 2 },
      { re: /\bscared\b/i, weight: 2 },
      { re: /\bfear\b/i, weight: 2 },
      { re: /fail(ing|ure)?/i, weight: 1 },
      { re: /what if (it|this|i)/i, weight: 1 },
    ],
    handle: statelessCategory("fear-of-failure", "encouragement", FEAR_OF_FAILURE_VARIANTS, captureFear),
  },
  {
    id: "self-doubt",
    mode: "encouragement",
    keywords: [
      { re: /don'?t think i can/i, weight: 3 },
      { re: /i('m| am) not (good|smart|experienced) enough/i, weight: 3 },
      { re: /not cut out for this/i, weight: 3 },
      { re: /i('m| am) failing (at|as)/i, weight: 2 },
      { re: /impostor/i, weight: 2 },
    ],
    handle: statelessCategory("self-doubt", "encouragement", SELF_DOUBT_VARIANTS, captureFear),
  },
  {
    id: "overwhelm",
    mode: "clarity",
    keywords: [
      { re: /overwhelm/i, weight: 3 },
      { re: /too much (on|going)|drowning|can'?t keep up/i, weight: 2 },
      { re: /don'?t know what to (work on|do) first/i, weight: 2 },
    ],
    handle: statelessCategory("overwhelm", "clarity", OVERWHELM_VARIANTS, capturePriority),
  },
  {
    id: "lack-of-direction",
    mode: "clarity",
    keywords: [
      { re: /what should i (focus on|do) (today|next|now)/i, weight: 3 },
      { re: /no (clear )?direction/i, weight: 2 },
      { re: /don'?t know where to start/i, weight: 2 },
      { re: /time management/i, weight: 1 },
    ],
    handle: statelessCategory("lack-of-direction", "clarity", LACK_OF_DIRECTION_VARIANTS, capturePriority),
  },
  {
    id: "work-life-balance",
    mode: "life-design",
    keywords: [
      { re: /work.?life|balance family|balance.*business/i, weight: 3 },
      { re: /\bhappy\b|happiness/i, weight: 2 },
      { re: /\bfamily\b/i, weight: 1 },
      { re: /\bhealth\b/i, weight: 1 },
      { re: /\brun(ning)?\b/i, weight: 1 },
      { re: /want to .*but be/i, weight: 2 },
    ],
    handle: statelessCategory("work-life-balance", "life-design", WORK_LIFE_BALANCE_VARIANTS),
  },
  {
    id: "burnout",
    mode: "encouragement",
    keywords: [
      { re: /exhaust/i, weight: 3 },
      { re: /burn(ed|t)? ?out/i, weight: 3 },
      { re: /\btired\b/i, weight: 1 },
      { re: /running on empty/i, weight: 2 },
    ],
    handle: statelessCategory("burnout", "encouragement", BURNOUT_VARIANTS),
  },
  {
    id: "motivation",
    mode: "encouragement",
    keywords: [
      { re: /motivat/i, weight: 3 },
      { re: /inspire|pump me up|energi[sz]e me/i, weight: 2 },
      { re: /losing (my )?drive/i, weight: 2 },
    ],
    handle: statelessCategory("motivation", "encouragement", MOTIVATION_VARIANTS),
  },
  {
    id: "avoidance-procrastination",
    mode: "execution",
    keywords: [
      { re: /keep planning|planning but/i, weight: 3 },
      { re: /procrastinat/i, weight: 3 },
      { re: /not making progress|spinning (my|our) wheels|nothing('s| is)? working|no results/i, weight: 2 },
      { re: /never (take|takes|took) action/i, weight: 2 },
      { re: /keep putting off|making excuses/i, weight: 2 },
    ],
    handle: statelessCategory("avoidance-procrastination", "execution", AVOIDANCE_VARIANTS),
  },

  // Financial
  {
    id: "financial-pressure",
    mode: "financial-discipline",
    keywords: [
      { re: /don'?t have enough money/i, weight: 3 },
      { re: /can'?t afford/i, weight: 2 },
      { re: /tight on (cash|money)/i, weight: 2 },
      { re: /no (money|cash|budget) to/i, weight: 2 },
    ],
    handle: statelessCategory("financial-pressure", "financial-discipline", FINANCIAL_PRESSURE_VARIANTS),
  },
  {
    id: "spending-decision",
    mode: "financial-discipline",
    keywords: [
      { re: /take out a loan|borrow(ing)? money|\bloan\b/i, weight: 3 },
      { re: /should i (spend|invest)/i, weight: 3 },
      { re: /spend money on (ads|advertising)/i, weight: 2 },
      { re: /worth (the )?investment/i, weight: 1 },
    ],
    handle: statelessCategory("spending-decision", "financial-discipline", SPENDING_DECISION_VARIANTS),
  },
  {
    id: "pricing",
    mode: "founder",
    keywords: [
      { re: /what (should i|to) charge/i, weight: 3 },
      { re: /\bpricing\b|price my|how much should i charge/i, weight: 3 },
      { re: /undercharg|underpric/i, weight: 2 },
    ],
    handle: statelessCategory("pricing", "founder", PRICING_VARIANTS),
  },

  // Team / leadership
  {
    id: "team-leadership",
    mode: "performance",
    keywords: [
      { re: /\bemployees?\b/i, weight: 1 },
      { re: /not performing|underperform|isn'?t performing|aren'?t performing/i, weight: 3 },
      { re: /\bmy team\b|\bmy staff\b/i, weight: 2 },
      { re: /leadership/i, weight: 1 },
    ],
    handle: statelessCategory("team-leadership", "performance", TEAM_LEADERSHIP_VARIANTS),
  },
  {
    id: "delegation",
    mode: "performance",
    keywords: [
      { re: /delegat/i, weight: 3 },
      { re: /do everything myself|can'?t let go/i, weight: 2 },
      { re: /hand off/i, weight: 1 },
    ],
    handle: statelessCategory("delegation", "performance", DELEGATION_VARIANTS),
  },

  // Decisions & planning
  {
    id: "difficult-decision",
    mode: "strategy",
    keywords: [
      { re: /want to quit my job/i, weight: 3 },
      { re: /should i quit/i, weight: 3 },
      { re: /don'?t know whether to/i, weight: 2 },
      { re: /difficult decision|hard decision/i, weight: 2 },
    ],
    handle: statelessCategory("difficult-decision", "strategy", DIFFICULT_DECISION_VARIANTS),
  },
  {
    id: "new-business-idea",
    mode: "founder",
    keywords: [
      { re: /(another|new|different) business idea/i, weight: 3 },
      { re: /too many (business )?ideas/i, weight: 3 },
      { re: /should i start (it|this|another)/i, weight: 2 },
    ],
    handle: statelessCategory("new-business-idea", "founder", NEW_BUSINESS_IDEA_VARIANTS),
  },
  {
    id: "income-goal",
    mode: "founder",
    keywords: [
      { re: /\$?\d{2,3}[,.]?\d{3}\b/i, weight: 2 },
      { re: /make \$?\d/i, weight: 2 },
      { re: /first year/i, weight: 1 },
      { re: /income goal|revenue goal/i, weight: 2 },
    ],
    handle: statelessCategory("income-goal", "founder", INCOME_GOAL_VARIANTS),
  },
  {
    id: "revenue-stall",
    mode: "strategy",
    keywords: [
      { re: /not growing|isn'?t growing|stopped growing/i, weight: 3 },
      { re: /plateau/i, weight: 3 },
      { re: /stuck at the same/i, weight: 2 },
    ],
    handle: statelessCategory("revenue-stall", "strategy", REVENUE_STALL_VARIANTS),
  },
  {
    id: "business-setback",
    mode: "encouragement",
    keywords: [
      { re: /made a mistake/i, weight: 3 },
      { re: /lost money/i, weight: 3 },
      { re: /\bfailed\b/i, weight: 1 },
      { re: /regret/i, weight: 1 },
    ],
    handle: statelessCategory("business-setback", "encouragement", BUSINESS_SETBACK_VARIANTS),
  },
  {
    id: "scaling-strategy",
    mode: "strategy",
    keywords: [
      { re: /\bscal(e|ing)\b/i, weight: 3 },
      { re: /long.?term strategy/i, weight: 2 },
      { re: /grow bigger|expand the business/i, weight: 2 },
    ],
    handle: statelessCategory("scaling-strategy", "strategy", SCALING_STRATEGY_VARIANTS),
  },

  // Structural — reuse the existing flows/topics so their content isn't duplicated
  { id: "assessment", mode: "clarity", keywords: [{ re: /analy[sz]e|where (do|does) (i|my business) stand|business assessment/i, weight: 3 }], handle: (s) => enterAssessment(s) },
  { id: "growth-plan", mode: "strategy", keywords: [{ re: /90.?day|roadmap|growth plan/i, weight: 3 }], handle: (s) => enterGrowthPlan(s) },
  { id: "website-review", mode: "clarity", keywords: [{ re: /website|landing page|my site\b/i, weight: 3 }], handle: (s) => enterWebsiteReview(s) },
  { id: "leads-topic", mode: "strategy", keywords: [{ re: /need more customers|\blead(s)?\b|customers? find/i, weight: 2 }], handle: (s) => enterTopic(s, "leads") },
  { id: "google-topic", mode: "strategy", keywords: [{ re: /google|gbp|business profile|maps listing|local search|\bseo\b/i, weight: 2 }], handle: (s) => enterTopic(s, "google-visibility") },
  { id: "marketing-topic", mode: "strategy", keywords: [{ re: /marketing|social media|advertis|email campaign/i, weight: 2 }], handle: (s) => enterTopic(s, "marketing") },
  { id: "systems-topic", mode: "performance", keywords: [{ re: /\bsystems?\b|\bsop\b|process(es)?|disorganized/i, weight: 2 }], handle: (s) => enterTopic(s, "systems") },
  { id: "automation-topic", mode: "strategy", keywords: [{ re: /automat|chatbot|workflow tool|\bai\b/i, weight: 2 }], handle: (s) => enterTopic(s, "automation") },
  { id: "prioritize-topic", mode: "clarity", keywords: [{ re: /priorit|too many (ideas|things|priorities)/i, weight: 2 }], handle: (s) => enterTopic(s, "prioritize") },
];

function contextualFallback(state: CoachState, text: string) {
  const businessNote = state.context.business ? `, and for what it's worth, that connects back to ${quote(state.context.business, 60)}` : "";
  return assistantMessage(
    `Here's what I want to make sure I understand: ${quote(text, 140)}${businessNote}. Tell me a bit more about what's driving that. Is this mainly a strategy question, something you're avoiding, a money decision, or how you're feeling about it right now?`,
    { mode: "clarity" }
  );
}

function routeFreeText(state: CoachState, userText: string) {
  const scored = INTENT_ROUTES.map((def) => ({ def, score: scoreIntent(def, userText) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { state: clearFlow(state), message: contextualFallback(state, userText) };
  }

  return scored[0].def.handle(state, userText);
}

// ---------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------

export function respond(state: CoachState, userText: string, promptId?: string): { state: CoachState; message: CoachMessage } {
  const trimmed = userText.trim();
  const merged = trimmed ? mergeContext(state, trimmed) : state;

  if (promptId && promptId.startsWith("score:")) {
    return advanceGrowthAssessment(merged, promptId);
  }

  if (promptId && PROMPT_HANDLERS[promptId]) {
    return PROMPT_HANDLERS[promptId](merged);
  }

  if (!trimmed) {
    return { state: merged, message: assistantMessage("Take your time. Whenever you're ready, tell me what's on your mind.", { mode: "clarity" }) };
  }

  if (merged.growthAssessment) {
    return {
      state: merged,
      message: assistantMessage("Pick one of the options above whenever you're ready. That keeps the score accurate and evidence-based.", { mode: "clarity" }),
    };
  }
  if (merged.flow) return advanceFlow(merged, trimmed);
  if (merged.topic) return handleTopicFollowup(merged, trimmed);
  return routeFreeText(merged, trimmed);
}
