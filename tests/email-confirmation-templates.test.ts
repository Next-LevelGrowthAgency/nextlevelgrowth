import { describe, expect, it } from "vitest";
import { buildContactConfirmationEmail, buildGrowthAuditConfirmationEmail } from "@/lib/growth-coach/email-templates";

describe("Contact confirmation email", () => {
  it("greets the visitor by first name and includes both html and text", () => {
    const { html, text, subject } = buildContactConfirmationEmail("Dana Lee");
    expect(subject.length).toBeGreaterThan(0);
    expect(html).toContain("Hi Dana");
    expect(text).toContain("Hi Dana");
  });

  it("escapes a malicious name in the html part but not the text part", () => {
    const { html, text } = buildContactConfirmationEmail("<script>alert(1)</script>");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(text).toContain("<script>alert(1)</script>");
  });

  it("falls back to a neutral greeting for a blank name", () => {
    const { html } = buildContactConfirmationEmail("   ");
    expect(html).toContain("Hi there");
  });
});

describe("Growth Audit confirmation email", () => {
  it("mentions the business name and the chosen contact method", () => {
    const { html, text } = buildGrowthAuditConfirmationEmail({ name: "Dana", businessName: "Dana's Bakery", preferredContact: "Phone" });
    expect(html).toContain("Dana&#39;s Bakery");
    expect(text).toContain("Dana's Bakery");
    expect(text.toLowerCase()).toContain("by phone");
  });

  it("escapes a malicious business name in html", () => {
    const { html } = buildGrowthAuditConfirmationEmail({ name: "Dana", businessName: "<img src=x onerror=alert(1)>", preferredContact: "Email" });
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
  });
});
