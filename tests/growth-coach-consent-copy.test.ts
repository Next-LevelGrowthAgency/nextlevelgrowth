import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { previewNotice } from "@/lib/growth-coach/config";
import { CONSENT_LANGUAGE_VERSION } from "@/lib/consent";

/**
 * Source-level regression guards for the Stage 4 consent/legal-copy audit
 * findings — no jsdom/RTL in this project (see
 * growth-coach-panel-positioning.test.ts's doc comment for why), so the
 * lead form's actual rendered checkbox copy is verified the same way that
 * file verifies CSS: read the component source directly and assert on it.
 */

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf-8");
}

describe("GrowthCoachLeadForm — no text-message/SMS consent checkbox (removed, no texting feature exists)", () => {
  const formSource = read("src/components/growth-coach/GrowthCoachLeadForm.tsx");
  // JSX text wraps across lines with indentation whitespace — normalize
  // before matching so this doesn't break on a harmless reflow/reformat.
  const normalized = formSource.replace(/\s+/g, " ");

  it("REGRESSION: the TCPA-style disclosure copy and the consentToTextMessage field are gone, not just hidden", () => {
    expect(normalized).not.toMatch(/Message and data rates may apply/);
    expect(normalized).not.toMatch(/Reply STOP to opt out/);
    expect(formSource).not.toContain("consentToTextMessage");
    expect(formSource).not.toContain("Text message");
  });

  it("the component still flags its remaining consent copy as draft/needs-legal-review, matching Terms/Privacy/Accessibility pages' PLACEHOLDER convention", () => {
    expect(normalized).toMatch(/DRAFT.{0,40}NEEDS HUMAN\/LEGAL REVIEW/);
  });

  it("documents why the SMS checkbox was removed, for whoever re-adds it later", () => {
    expect(normalized.toLowerCase()).toContain("no texting feature");
  });
});

describe("Terms of Service page displays TERMS_OF_SERVICE_VERSION, the same constant stored on a lead's consent record", () => {
  it("renders the version constant, not a hard-coded duplicate string", () => {
    const termsSource = read("src/app/terms/page.tsx");
    expect(termsSource).toContain("TERMS_OF_SERVICE_VERSION");
    expect(termsSource).toContain('from "@/lib/consent"');
  });
});

describe("previewNotice — no longer falsely claims the Growth Coach isn't a live AI connection", () => {
  it("does not contain the stale 'not a live AI connection' / 'demonstration content' claim", () => {
    expect(previewNotice.toLowerCase()).not.toContain("not a live ai connection");
    expect(previewNotice.toLowerCase()).not.toContain("demonstration content");
  });

  it("still discloses that the visitor is talking to an AI, not a human — true in both the AI-configured and scripted-fallback states", () => {
    expect(previewNotice.toLowerCase()).toContain("ai assistant");
  });
});

describe("CONSENT_LANGUAGE_VERSION — bumped alongside the Stage 4 disclosure copy change", () => {
  it("is a non-empty, dated string (YYYY-MM-DD)", () => {
    expect(CONSENT_LANGUAGE_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("Admin lead pages surface the consent record (channels, timestamps, and audit trail)", () => {
  const listSource = read("src/app/admin/(protected)/leads/page.tsx");
  const detailSource = read("src/app/admin/(protected)/leads/[id]/page.tsx");

  it("the leads list shows a per-lead consent summary column", () => {
    expect(listSource).toContain("Consented to");
    expect(listSource).toContain("consentSummary(lead)");
  });

  it("the lead detail page renders all four consent channels with their granted timestamps", () => {
    expect(detailSource).toContain("Consent Record");
    expect(detailSource).toContain("lead.consentToSaveReport");
    expect(detailSource).toContain("lead.consentToEmailFollowUp");
    expect(detailSource).toContain("lead.consentToPhoneCall");
    expect(detailSource).toContain("lead.consentToMarketing");
    expect(detailSource).toContain("lead.reportConsentTimestamp");
    expect(detailSource).toContain("lead.contactConsentTimestamp");
    expect(detailSource).toContain("lead.marketingConsentTimestamp");
  });

  it("REGRESSION: no longer renders a text-message consent row — that channel was removed", () => {
    expect(detailSource).not.toContain("consentToTextMessage");
    expect(listSource).not.toContain("consentToTextMessage");
  });

  it("the lead detail page renders the strengthened audit trail: terms version, language version, hashed IP, user agent", () => {
    expect(detailSource).toContain("lead.consentTermsVersion");
    expect(detailSource).toContain("lead.consentLanguageVersion");
    expect(detailSource).toContain("lead.consentIpHash");
    expect(detailSource).toContain("lead.consentUserAgent");
  });
});
