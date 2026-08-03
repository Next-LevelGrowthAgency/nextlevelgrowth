import { describe, expect, it } from "vitest";
import { localLeadAdapter } from "@/lib/growth-coach/adapters/local-mock";
import { getInitialState, respond } from "@/lib/growth-coach/engine";
import { buildLeadInput } from "@/lib/growth-coach/lead-profile";
import { leadSubmissionSchema } from "@/lib/growth-coach/lead-schema";
import { isRateLimited } from "@/lib/rate-limit";
import { containsSensitiveData } from "@/lib/growth-coach/sensitive-data";
import type { BusinessGrowthReport, CoachContext } from "@/types";

/**
 * Regression coverage for bugs found and fixed earlier in this project
 * (documented in prior completion reports). Each test names the bug it
 * guards against so a future change that reintroduces it fails loudly.
 */

const emptyContext: CoachContext = {
  business: null,
  primaryGoal: null,
  mainFear: null,
  weeklyHours: null,
  currentPriority: null,
  ninetyDayPlanRequested: false,
};

function fakeReport(overrides: Partial<BusinessGrowthReport> = {}): BusinessGrowthReport {
  return {
    generatedAt: Date.now(),
    businessName: null,
    visitorName: null,
    executiveSummary: "",
    currentState: "",
    idealState: "",
    growthGap: "",
    rootCauses: [],
    strengths: [],
    topOpportunities: [],
    quickWins: [],
    thirtyDayPlan: [],
    ninetyDayRoadmap: { days1to30: [], days31to60: [], days61to90: [] },
    keyMetrics: [],
    risksAndConstraints: [],
    recommendedServices: [],
    recommendedPlan: { planId: "foundation", name: "Foundation", reason: "", included: [], notIncluded: [], nextStep: "" },
    nextAction: "",
    ...overrides,
  };
}

describe("Regression: business-name extraction must not store a full raw sentence", () => {
  it("falls back to nothing (not the sentence) when the form field is blank and context.business is a long description", () => {
    const report = fakeReport({ businessName: "I run a bakery in Austin, my biggest challenge is my outdated website." });
    const input = buildLeadInput(
      { firstName: "Dana", email: "dana@example.com", consentToSaveReport: true, consentToEmailFollowUp: false, consentToPhoneCall: false, consentToTextMessage: false, consentToMarketing: false },
      report,
      emptyContext,
      "session-1"
    );
    expect(input.businessName).toBeUndefined();
  });

  it("uses the form field when provided", () => {
    const report = fakeReport({ businessName: "Some long raw sentence that is not a name at all." });
    const input = buildLeadInput(
      { firstName: "Dana", email: "dana@example.com", businessName: "Dana's Bakery", consentToSaveReport: true, consentToEmailFollowUp: false, consentToPhoneCall: false, consentToTextMessage: false, consentToMarketing: false },
      report,
      emptyContext,
      "session-1"
    );
    expect(input.businessName).toBe("Dana's Bakery");
  });

  it("uses a short, clean business name from context when the form is blank", () => {
    const report = fakeReport({ businessName: "Dana's Bakery" });
    const input = buildLeadInput(
      { firstName: "Dana", email: "dana@example.com", consentToSaveReport: true, consentToEmailFollowUp: false, consentToPhoneCall: false, consentToTextMessage: false, consentToMarketing: false },
      report,
      emptyContext,
      "session-1"
    );
    expect(input.businessName).toBe("Dana's Bakery");
  });
});

describe("Regression: dashboard must see leads created via the API route", () => {
  it("localLeadAdapter is a shared singleton — a lead created is visible via listLeads()", async () => {
    const before = (await localLeadAdapter.listLeads()).length;
    await localLeadAdapter.createLead({
      sessionId: "s-regression",
      source: "test",
      email: `regression-${Date.now()}@example.com`,
      consentToSaveReport: true,
      consentToContact: false,
      consentToMarketing: false,
    });
    const after = await localLeadAdapter.listLeads();
    expect(after.length).toBe(before + 1);
  });
});

describe("Regression: lead schema validation fails clearly", () => {
  const base = {
    sessionId: "s1",
    firstName: "Dana",
    email: "dana@example.com",
    consentToSaveReport: true as const,
    consentToEmailFollowUp: false,
    consentToPhoneCall: false,
    consentToTextMessage: false,
    consentToMarketing: false,
    report: {},
    context: {},
  };

  it("invalid email is rejected", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("invalid website URL is rejected", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, websiteUrl: "not a url" });
    expect(result.success).toBe(false);
  });

  it("missing report-save consent is rejected", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, consentToSaveReport: false });
    expect(result.success).toBe(false);
  });

  it("valid submission with only required fields passes", () => {
    const result = leadSubmissionSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("consenting to a phone call without a phone number is rejected", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, consentToPhoneCall: true, phone: "" });
    expect(result.success).toBe(false);
  });

  it("consenting to a text message without a phone number is rejected", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, consentToTextMessage: true, phone: "" });
    expect(result.success).toBe(false);
  });

  it("consenting to a phone call WITH a phone number passes", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, consentToPhoneCall: true, phone: "555-123-4567" });
    expect(result.success).toBe(true);
  });

  it("the three contact permissions are independent — email-only consent doesn't require a phone number", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, consentToEmailFollowUp: true });
    expect(result.success).toBe(true);
  });

  it("accepts turnstileToken: null — same shared field as contact/growth-audit, same live bug while Turnstile is unconfigured", () => {
    const result = leadSubmissionSchema.safeParse({ ...base, turnstileToken: null });
    expect(result.success).toBe(true);
  });
});

describe("Regression: sensitive-data detection stays active", () => {
  it.each(["my password is hunter2", "123-45-6789", "4111 1111 1111 1111", "here is my SSN"])("flags: %s", (text) => {
    expect(containsSensitiveData(text)).toBe(true);
  });

  it("does not false-positive on ordinary business text", () => {
    expect(containsSensitiveData("Austin, TX")).toBe(false);
    expect(containsSensitiveData("Dana's Bakery")).toBe(false);
  });
});

describe("Regression: rate limiting stays active", () => {
  it("blocks after the configured max within the window", () => {
    const key = `regression-${Date.now()}`;
    let blocked = false;
    for (let i = 0; i < 10; i += 1) {
      blocked = isRateLimited("regression-bucket", key, 60_000, 5);
    }
    expect(blocked).toBe(true);
  });

  it("does not block a fresh key", () => {
    expect(isRateLimited("regression-bucket", `fresh-${Date.now()}`, 60_000, 5)).toBe(false);
  });
});

describe("Response-depth selection", () => {
  it("Quick Answer mode finishes the assessment flow after a single answer", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "depth-quick"));
    expect(state.responseDepth).toBe("quick");
    ({ state } = respond(state, "", "analyze"));
    expect(state.flow).toBe("assessment");
    const { state: afterAnswer, message } = respond(state, "I run a small landscaping company in Denver.");
    expect(afterAnswer.flow).toBeNull(); // short-circuited straight to a finished report, not step 1
    expect(message.businessReport ?? message.report).toBeTruthy();
  });

  it("Deep Analysis mode still asks the full multi-step sequence", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "depth-deep"));
    ({ state } = respond(state, "", "analyze"));
    const { state: afterAnswer } = respond(state, "I run a small landscaping company in Denver.");
    expect(afterAnswer.flow).toBe("assessment");
    expect(afterAnswer.step).toBe(1);
  });

  it("natural language switches depth mid-conversation", () => {
    const { state } = respond(getInitialState(), "Can you just give me the quick version?");
    expect(state.responseDepth).toBe("quick");
  });
});

describe("Business-path selection adapts the assessment opener", () => {
  it("Start My Business asks about the idea, not existing performance", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "path-start"));
    expect(state.businessPath).toBe("start");
    const { message } = respond(state, "", "analyze");
    expect(message.content.toLowerCase()).toContain("idea");
  });

  it("Grow My Business asks about current obstacles, not startup validation", () => {
    let state = getInitialState();
    ({ state } = respond(state, "", "path-grow"));
    const { message } = respond(state, "", "analyze");
    expect(message.content.toLowerCase()).toContain("obstacle");
  });
});

describe("90-day plan request is tracked separately from the free 30-day plan", () => {
  it("defaults to not requested, and flips true only after an explicit yes", () => {
    expect(getInitialState().context.ninetyDayPlanRequested).toBe(false);
    let state = getInitialState();
    state = { ...state, businessReport: fakeReport() };
    ({ state } = respond(state, "", "ninety-day-yes"));
    expect(state.context.ninetyDayPlanRequested).toBe(true);
  });
});

describe("Regression: duplicate submissions merge instead of creating a second lead", () => {
  it("same email within the window updates the existing lead", async () => {
    const email = `dup-${Date.now()}@example.com`;
    const first = await localLeadAdapter.createLead({ sessionId: "s1", source: "test", email, businessName: "First", consentToSaveReport: true, consentToContact: false, consentToMarketing: false });
    const second = await localLeadAdapter.createLead({ sessionId: "s1", source: "test", email, businessName: "Updated", consentToSaveReport: true, consentToContact: true, consentToMarketing: false });
    expect(second.id).toBe(first.id);
    expect(second.businessName).toBe("Updated");
  });
});
