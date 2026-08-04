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

describe("GrowthCoachLeadForm — SMS/text-message consent carries TCPA-style disclosure", () => {
  const formSource = read("src/components/growth-coach/GrowthCoachLeadForm.tsx");
  // JSX text wraps across lines with indentation whitespace — normalize
  // before matching so this doesn't break on a harmless reflow/reformat.
  const normalized = formSource.replace(/\s+/g, " ");

  it("the text-message checkbox copy includes rate/frequency, opt-out, and not-a-condition-of-purchase language", () => {
    expect(normalized).toMatch(/Message and data rates may apply/);
    expect(normalized).toMatch(/Message frequency varies/);
    expect(normalized).toMatch(/Reply STOP to opt out/);
    expect(normalized).toMatch(/not a condition of purchase/i);
  });

  it("the component flags its own consent copy as draft/needs-legal-review, matching Terms/Privacy/Accessibility pages' PLACEHOLDER convention", () => {
    expect(normalized).toMatch(/DRAFT.{0,40}NEEDS HUMAN\/LEGAL REVIEW/);
    expect(formSource.toUpperCase()).toContain("TCPA");
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
