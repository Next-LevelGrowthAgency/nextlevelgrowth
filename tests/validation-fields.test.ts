import { describe, expect, it } from "vitest";
import { emailField, messageField, nameField, optionalPhoneField, optionalTrimmedString, optionalUrlField, phoneField } from "@/lib/validation/fields";

/**
 * ROOT CAUSE regression coverage: the live site was rejecting valid email
 * addresses with a generic "please check your entries" message because
 * `z.string().email()` was used directly (no `.trim()`) in the contact and
 * growth-audit schemas — any leading/trailing whitespace from mobile
 * keyboard autocomplete/autofill made an otherwise-valid Gmail/Outlook/etc.
 * address fail. Every email field in the app must go through `emailField`.
 */
describe("emailField — the actual bug that was live", () => {
  it.each([
    "person@gmail.com",
    "person@outlook.com",
    "person@yahoo.com",
    "person@icloud.com",
    "first.last@acme-consulting.com",
    "person+tag@gmail.com",
  ])("accepts a valid address from a real provider: %s", (email) => {
    expect(emailField.safeParse(email).success).toBe(true);
  });

  it("accepts and normalizes an address with leading whitespace", () => {
    const r = emailField.safeParse("  person@gmail.com");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("person@gmail.com");
  });

  it("accepts and normalizes an address with trailing whitespace", () => {
    const r = emailField.safeParse("person@gmail.com  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("person@gmail.com");
  });

  it("accepts and normalizes an address with both leading and trailing whitespace", () => {
    const r = emailField.safeParse("  Person@Gmail.com  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("person@gmail.com");
  });

  it("accepts and lowercases a mixed-case address", () => {
    const r = emailField.safeParse("Person.Name@Gmail.COM");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("person.name@gmail.com");
  });

  it("still rejects a genuinely malformed address", () => {
    expect(emailField.safeParse("not-an-email").success).toBe(false);
    expect(emailField.safeParse("missing-domain@").success).toBe(false);
    expect(emailField.safeParse("@missing-local.com").success).toBe(false);
  });

  it("rejects a missing/blank email", () => {
    expect(emailField.safeParse("").success).toBe(false);
    expect(emailField.safeParse("   ").success).toBe(false);
  });
});

describe("nameField — reasonable but not overly restrictive", () => {
  it.each(["Dana", "O'Brien", "Anne-Marie", "José García", "Al Jr.", "Renée"])("accepts a legitimate name: %s", (name) => {
    expect(nameField().safeParse(name).success).toBe(true);
  });

  it("trims leading/trailing whitespace", () => {
    const r = nameField().safeParse("  Dana  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("Dana");
  });

  it("rejects a blank name", () => {
    expect(nameField().safeParse("").success).toBe(false);
    expect(nameField().safeParse("   ").success).toBe(false);
  });

  it("rejects a name that's actually markup/script injection", () => {
    expect(nameField().safeParse("<script>alert(1)</script>").success).toBe(false);
  });
});

describe("phoneField / optionalPhoneField — validates by digit count, not formatting", () => {
  it.each(["555-123-4567", "(555) 123-4567", "+1 555 123 4567", "555.123.4567", "5551234567"])(
    "accepts a plausibly formatted phone number: %s",
    (phone) => {
      expect(phoneField.safeParse(phone).success).toBe(true);
    }
  );

  it("rejects too few digits", () => {
    expect(phoneField.safeParse("12345").success).toBe(false);
  });

  it("optionalPhoneField normalizes a blank value to undefined", () => {
    const r = optionalPhoneField.safeParse("");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });

  it("optionalPhoneField still validates a non-blank value", () => {
    expect(optionalPhoneField.safeParse("123").success).toBe(false);
  });
});

describe("optionalTrimmedString — blank normalizes to undefined, not empty string", () => {
  it("treats a whitespace-only value the same as a missing one", () => {
    const blank = optionalTrimmedString().safeParse("   ");
    const missing = optionalTrimmedString().safeParse("");
    expect(blank.success && missing.success).toBe(true);
    if (blank.success && missing.success) {
      expect(blank.data).toBeUndefined();
      expect(missing.data).toBeUndefined();
    }
  });

  it("preserves real content", () => {
    const r = optionalTrimmedString().safeParse("  Some real note  ");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("Some real note");
  });
});

describe("optionalUrlField", () => {
  it("accepts a valid http(s) URL", () => {
    expect(optionalUrlField.safeParse("https://example.com").success).toBe(true);
  });
  it("normalizes blank to undefined", () => {
    const r = optionalUrlField.safeParse("");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBeUndefined();
  });
  it("rejects a non-URL value", () => {
    expect(optionalUrlField.safeParse("not a url").success).toBe(false);
  });
});

describe("messageField — preserves internal line breaks, enforces min/max", () => {
  it("preserves meaningful line breaks", () => {
    const r = messageField().safeParse("Line one\nLine two");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("Line one\nLine two");
  });
  it("rejects an empty message", () => {
    expect(messageField().safeParse("").success).toBe(false);
  });
  it("rejects an oversized message", () => {
    expect(messageField({ max: 20 }).safeParse("x".repeat(21)).success).toBe(false);
  });
});
