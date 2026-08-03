import { describe, expect, it } from "vitest";
import { isSafeRedirectPath, sanitizeRedirectPath } from "@/lib/safe-redirect";

describe("isSafeRedirectPath — open-redirect prevention", () => {
  it.each(["/portal", "/portal/requests", "/admin/leads/123"])("accepts a same-origin path: %s", (path) => {
    expect(isSafeRedirectPath(path)).toBe(true);
  });

  it.each([
    "https://evil.com",
    "http://evil.com/phish",
    "//evil.com",
    "//evil.com/path",
    "evil.com",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("rejects an unsafe or non-path value: %s", (path) => {
    expect(isSafeRedirectPath(path as string | null | undefined)).toBe(false);
  });

  it("rejects a backslash-based bypass attempt", () => {
    expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
  });
});

describe("sanitizeRedirectPath", () => {
  it("passes through a safe path unchanged", () => {
    expect(sanitizeRedirectPath("/portal/settings", "/portal")).toBe("/portal/settings");
  });
  it("falls back for an unsafe path", () => {
    expect(sanitizeRedirectPath("https://evil.com", "/portal")).toBe("/portal");
  });
  it("falls back for a missing value", () => {
    expect(sanitizeRedirectPath(null, "/portal")).toBe("/portal");
  });
});
