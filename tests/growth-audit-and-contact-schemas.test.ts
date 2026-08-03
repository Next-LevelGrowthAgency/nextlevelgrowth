import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact-schema";
import { growthAuditSchema } from "@/lib/growth-audit-schema";

const validAuditBase = {
  name: "Dana Lee",
  businessName: "Dana's Landscaping",
  email: "dana@gmail.com",
  websiteUrl: "",
  industry: "Home Services / Contracting",
  location: "Austin, TX",
  primaryGoal: "Generate more leads",
  biggestChallenge: "Not enough inbound calls.",
  servicesOfInterest: ["Local SEO"],
  additionalDetails: "",
  hpToken: "",
};

describe("Growth Audit — phone is conditionally required by preferred contact method (previously always required)", () => {
  it("Email preferred + no phone: PASSES (this was the bug — it used to fail here)", () => {
    const result = growthAuditSchema.safeParse({ ...validAuditBase, phone: "", preferredContact: "Email" });
    expect(result.success).toBe(true);
  });

  it("Phone preferred + no phone number: fails with an error on the phone field specifically", () => {
    const result = growthAuditSchema.safeParse({ ...validAuditBase, phone: "", preferredContact: "Phone" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "phone")).toBe(true);
    }
  });

  it("Text preferred + no phone number: fails with an error on the phone field specifically", () => {
    const result = growthAuditSchema.safeParse({ ...validAuditBase, phone: "", preferredContact: "Text" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "phone")).toBe(true);
    }
  });

  it("Phone preferred + a valid phone number: passes", () => {
    const result = growthAuditSchema.safeParse({ ...validAuditBase, phone: "555-123-4567", preferredContact: "Phone" });
    expect(result.success).toBe(true);
  });

  it("a leading/trailing-whitespace Gmail address is accepted (the reported live bug)", () => {
    const result = growthAuditSchema.safeParse({ ...validAuditBase, email: "  dana@gmail.com  ", phone: "", preferredContact: "Email" });
    expect(result.success).toBe(true);
  });
});

describe("Contact form schema", () => {
  const validContact = { name: "Dana Lee", email: "dana@gmail.com", message: "I'd like to learn more.", phone: "", companyName: "", hpToken: "" };

  it("accepts a minimal valid submission", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("accepts a Gmail address with surrounding whitespace (the reported live bug)", () => {
    const result = contactSchema.safeParse({ ...validContact, email: " dana@gmail.com " });
    expect(result.success).toBe(true);
  });

  it("optional phone and company fields are truly optional", () => {
    const result = contactSchema.safeParse({ name: "Dana", email: "dana@gmail.com", message: "Hello" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing message", () => {
    expect(contactSchema.safeParse({ ...validContact, message: "" }).success).toBe(false);
  });
});

describe("Regression: turnstileToken null broke every real submission (Turnstile unconfigured)", () => {
  it("contactSchema accepts turnstileToken: null, matching exactly what ContactForm.tsx sends while Turnstile is off", () => {
    const result = contactSchema.safeParse({
      name: "Dana Lee",
      email: "dana@gmail.com",
      message: "I'd like to learn more.",
      phone: "",
      companyName: "",
      hpToken: "",
      turnstileToken: null,
    });
    expect(result.success).toBe(true);
  });

  it("growthAuditSchema accepts turnstileToken: null, matching exactly what GrowthAuditForm.tsx sends while Turnstile is off", () => {
    const result = growthAuditSchema.safeParse({
      ...validAuditBase,
      phone: "",
      preferredContact: "Email",
      turnstileToken: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("Regression: duplicate '(optional)' label bug", () => {
  it("GrowthAuditForm no longer hardcodes '(optional)' inside a label that already renders it via the field wrapper", () => {
    const source = readFileSync(new URL("../src/components/forms/GrowthAuditForm.tsx", import.meta.url), "utf-8");
    expect(source).not.toContain("Anything else we should know? (optional)");
  });
});
