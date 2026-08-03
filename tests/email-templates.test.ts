import { describe, expect, it } from "vitest";
import { buildInternalLeadEmail, buildInternalLeadEmailSubject, buildVisitorReportEmail, escapeHtml } from "@/lib/growth-coach/email-templates";
import { buildOwnerSummary } from "@/lib/growth-coach/lead-profile";
import type { LeadProfile } from "@/types";

function fakeLead(overrides: Partial<LeadProfile> = {}): LeadProfile {
  return {
    id: "lead-1",
    sessionId: "session-1",
    source: "growth-coach",
    firstName: "Dana",
    email: "dana@example.com",
    businessName: "Dana's Bakery",
    primaryGoal: "Grow monthly revenue",
    growthGap: "Website isn't converting visitors into leads",
    nextAction: "Rewrite the homepage headline this week",
    thirtyDayPlan: ["Fix the homepage headline", "Add a clear call-to-action"],
    ninetyDayRoadmap: { days1to30: ["Fix headline"], days31to60: ["Add reviews"], days61to90: ["Launch new landing page"] },
    recommendedServices: [
      {
        serviceId: "website-redesign",
        name: "Website Redesign",
        problem: "Outdated site",
        relevance: "Came up as the top priority",
        benefitType: "Improved conversion",
        priority: "do-now",
        whatToMeasure: "Conversion rate",
      },
    ],
    recommendedPlan: { planId: "foundation", name: "Foundation", reason: "One clear priority", included: [], notIncluded: [], nextStep: "Start" },
    leadQualificationLevel: "qualified-opportunity",
    consultationRequested: false,
    ninetyDayPlanRequested: false,
    consentToSaveReport: true,
    consentToContact: true,
    consentToEmailFollowUp: true,
    consentToPhoneCall: false,
    consentToTextMessage: false,
    consentToMarketing: false,
    followUpStatus: "new",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("escapeHtml", () => {
  it("escapes all five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert('x')</script> & "quotes"`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; &quot;quotes&quot;"
    );
  });
});

describe("Internal lead notification email", () => {
  it("renders both html and text, and the subject names the business and the gap", () => {
    const lead = fakeLead();
    const summary = buildOwnerSummary(lead);
    const subject = buildInternalLeadEmailSubject(lead);
    const { html, text } = buildInternalLeadEmail(lead, summary);

    expect(subject).toContain("Dana's Bakery");
    expect(html).toContain("New Growth Coach Lead");
    expect(text).toContain("NEW GROWTH COACH LEAD");
    expect(html).toContain("dana@example.com");
    expect(text).toContain("dana@example.com");
  });

  it("escapes malicious business/contact text in the HTML part but not the plain-text part", () => {
    const lead = fakeLead({ businessName: `<img src=x onerror=alert(1)>`, firstName: "Evil<script>" });
    const summary = buildOwnerSummary(lead);
    const { html, text } = buildInternalLeadEmail(lead, summary);

    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(text).toContain("<img src=x onerror=alert(1)>"); // plain text needs no escaping
  });

  it("labels data sources rather than presenting inferences as confirmed facts", () => {
    const lead = fakeLead();
    const summary = buildOwnerSummary(lead);
    const { html, text } = buildInternalLeadEmail(lead, summary);
    expect(html.toLowerCase()).toContain("user_stated");
    expect(text.toLowerCase()).toContain("system_derived");
  });

  it("includes consent status for all three granular contact permissions", () => {
    const lead = fakeLead();
    const summary = buildOwnerSummary(lead);
    const { html } = buildInternalLeadEmail(lead, summary);
    expect(html).toContain("Email follow-up");
    expect(html).toContain("Phone call");
    expect(html).toContain("Text message");
  });
});

describe("Visitor report email", () => {
  it("renders both html and text with the 30-day plan", () => {
    const lead = fakeLead();
    const { html, text, subject } = buildVisitorReportEmail(lead);
    expect(subject).toBe("Your Personalized Next Level Growth Plan");
    expect(html).toContain("Fix the homepage headline");
    expect(text).toContain("Fix the homepage headline");
  });

  it("includes the full 90-day roadmap only when ninetyDayPlanRequested is true", () => {
    const notRequested = buildVisitorReportEmail(fakeLead({ ninetyDayPlanRequested: false }));
    expect(notRequested.html).not.toContain("Add reviews");
    expect(notRequested.html).toContain("Reply to this email");

    const requested = buildVisitorReportEmail(fakeLead({ ninetyDayPlanRequested: true }));
    expect(requested.html).toContain("Add reviews");
    expect(requested.html).toContain("Launch new landing page");
  });

  it("never leaks internal lead-qualification labels or scoring language to the visitor", () => {
    const lead = fakeLead({ leadQualificationLevel: "high-priority-follow-up" });
    const { html, text } = buildVisitorReportEmail(lead);
    expect(html.toLowerCase()).not.toContain("qualification");
    expect(html.toLowerCase()).not.toContain("high-priority-follow-up");
    expect(text.toLowerCase()).not.toContain("qualification");
  });

  it("escapes malicious content in the visitor's own name", () => {
    const lead = fakeLead({ firstName: `<script>alert(1)</script>` });
    const { html } = buildVisitorReportEmail(lead);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
