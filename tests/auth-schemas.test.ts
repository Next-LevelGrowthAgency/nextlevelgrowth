import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, profileUpdateSchema, resetPasswordSchema, signupSchema } from "@/lib/auth-schemas";

describe("signupSchema", () => {
  const valid = { fullName: "Dana Lee", email: "dana@gmail.com", businessName: "Dana's Bakery", password: "correct-horse", confirmPassword: "correct-horse" };

  it("accepts a valid signup", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a whitespace-padded, mixed-case Gmail address (same root-cause fix as the other forms)", () => {
    expect(signupSchema.safeParse({ ...valid, email: "  Dana@Gmail.com  " }).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((i) => i.path[0] === "confirmPassword")).toBe(true);
  });

  it("rejects a too-short password", () => {
    expect(signupSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" }).success).toBe(false);
  });

  it("business name is optional", () => {
    expect(signupSchema.safeParse({ ...valid, businessName: undefined }).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    expect(loginSchema.safeParse({ email: "dana@gmail.com", password: "anything" }).success).toBe(true);
  });
  it("rejects a missing password", () => {
    expect(loginSchema.safeParse({ email: "dana@gmail.com", password: "" }).success).toBe(false);
  });
});

describe("forgotPasswordSchema / resetPasswordSchema", () => {
  it("forgotPasswordSchema accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "dana@gmail.com" }).success).toBe(true);
  });
  it("resetPasswordSchema rejects mismatched passwords", () => {
    expect(resetPasswordSchema.safeParse({ password: "correct-horse", confirmPassword: "battery-staple" }).success).toBe(false);
  });
  it("resetPasswordSchema accepts matching passwords", () => {
    expect(resetPasswordSchema.safeParse({ password: "correct-horse", confirmPassword: "correct-horse" }).success).toBe(true);
  });
});

describe("profileUpdateSchema", () => {
  it("accepts a full update", () => {
    expect(profileUpdateSchema.safeParse({ fullName: "Dana Lee", businessName: "Dana's Bakery", phone: "555-123-4567" }).success).toBe(true);
  });
  it("business name and phone are optional", () => {
    expect(profileUpdateSchema.safeParse({ fullName: "Dana Lee" }).success).toBe(true);
  });
  it("rejects a blank full name", () => {
    expect(profileUpdateSchema.safeParse({ fullName: "" }).success).toBe(false);
  });
});
