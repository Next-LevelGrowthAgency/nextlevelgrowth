import { describe, expect, it } from "vitest";
import { localLeadAdapter } from "@/lib/growth-coach/adapters/local-mock";
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

const emptyContext: CoachContext = { business: null, primaryGoal: null, mainFear: null, weeklyHours: null, currentPriority: null };

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
      { firstName: "Dana", email: "dana@example.com", consentToSaveReport: true, consentToContact: false, consentToMarketing: false },
      report,
      emptyContext,
      "session-1"
    );
    expect(input.businessName).toBeUndefined();
  });

  it("uses the form field when provided", () => {
    const report = fakeReport({ businessName: "Some long raw sentence that is not a name at all." });
    const input = buildLeadInput(
      { firstName: "Dana", email: "dana@example.com", businessName: "Dana's Bakery", consentToSaveReport: true, consentToContact: false, consentToMarketing: false },
      report,
      emptyContext,
      "session-1"
    );
    expect(input.businessName).toBe("Dana's Bakery");
  });

  it("uses a short, clean business name from context when the form is blank", () => {
    const report = fakeReport({ businessName: "Dana's Bakery" });
    const input = buildLeadInput(
      { firstName: "Dana", email: "dana@example.com", consentToSaveReport: true, consentToContact: false, consentToMarketing: false },
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
    consentToContact: false,
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

describe("Regression: duplicate submissions merge instead of creating a second lead", () => {
  it("same email within the window updates the existing lead", async () => {
    const email = `dup-${Date.now()}@example.com`;
    const first = await localLeadAdapter.createLead({ sessionId: "s1", source: "test", email, businessName: "First", consentToSaveReport: true, consentToContact: false, consentToMarketing: false });
    const second = await localLeadAdapter.createLead({ sessionId: "s1", source: "test", email, businessName: "Updated", consentToSaveReport: true, consentToContact: true, consentToMarketing: false });
    expect(second.id).toBe(first.id);
    expect(second.businessName).toBe("Updated");
  });
});
