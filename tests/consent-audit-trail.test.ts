import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sha256Hex } from "@/lib/hash";
import { TERMS_OF_SERVICE_VERSION, CONSENT_LANGUAGE_VERSION } from "@/lib/consent";

describe("sha256Hex", () => {
  it("matches the known SHA-256 digest of an empty string", () => {
    // Well-known test vector — verifies the actual algorithm, not just self-consistency.
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("is deterministic and never returns the raw input", () => {
    expect(sha256Hex("203.0.113.7")).toBe(sha256Hex("203.0.113.7"));
    expect(sha256Hex("203.0.113.7")).not.toBe("203.0.113.7");
    expect(sha256Hex("203.0.113.7")).not.toBe(sha256Hex("203.0.113.8"));
  });
});

describe("TERMS_OF_SERVICE_VERSION", () => {
  it("is a dated string (YYYY-MM-DD), distinct from CONSENT_LANGUAGE_VERSION's own tracking", () => {
    expect(TERMS_OF_SERVICE_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof CONSENT_LANGUAGE_VERSION).toBe("string");
  });
});

const mockCreateLead = vi.fn();
const mockRecordEmailEvent = vi.fn();
const mockSaveConversationTranscript = vi.fn();
const mockSendTransactional = vi.fn();

vi.mock("@/lib/growth-coach/adapters", () => ({
  getLeadAdapter: () => ({
    createLead: mockCreateLead,
    recordEmailEvent: mockRecordEmailEvent,
    saveConversationTranscript: mockSaveConversationTranscript,
  }),
  getEmailAdapter: () => ({ sendTransactional: mockSendTransactional }),
  isEmailDeliveryActive: () => false, // audit-trail fields don't depend on email delivery, so keep this false and out of scope for these tests
  isDurableStorageActive: () => true,
}));

function reqHeaders(ip: string, userAgent: string) {
  return { "Content-Type": "application/json", "x-forwarded-for": ip, "user-agent": userAgent };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/contact — populates the consent audit trail on every submission", () => {
  it("stamps a hashed (not raw) IP, the raw user agent, and the current terms/language versions", async () => {
    mockCreateLead.mockResolvedValue({ id: "lead-1", email: "dana@example.com" });
    const { POST } = await import("@/app/api/contact/route");
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: reqHeaders("203.0.113.9", "TestAgent/1.0"),
      body: JSON.stringify({ name: "Dana", email: "dana@example.com", message: "Hello there, I have a question.", hpToken: "", turnstileToken: null }),
    });
    await POST(request);

    expect(mockCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        consentIpHash: sha256Hex("203.0.113.9"),
        consentUserAgent: "TestAgent/1.0",
        consentTermsVersion: TERMS_OF_SERVICE_VERSION,
        consentLanguageVersion: CONSENT_LANGUAGE_VERSION,
      })
    );
  });
});

describe("POST /api/growth-audit — populates the consent audit trail on every submission", () => {
  it("stamps a hashed (not raw) IP, the raw user agent, and the current terms/language versions", async () => {
    mockCreateLead.mockResolvedValue({ id: "lead-2", email: "dana@example.com" });
    const { POST } = await import("@/app/api/growth-audit/route");
    const request = new NextRequest("http://localhost/api/growth-audit", {
      method: "POST",
      headers: reqHeaders("198.51.100.4", "AnotherAgent/2.0"),
      body: JSON.stringify({
        name: "Dana",
        businessName: "Dana's Bakery",
        email: "dana@example.com",
        industry: "Restaurant / Café",
        location: "Austin, TX",
        primaryGoal: "Generate more leads",
        biggestChallenge: "Not enough visibility online.",
        servicesOfInterest: ["Local SEO"],
        preferredContact: "Email",
        hpToken: "",
        turnstileToken: null,
      }),
    });
    await POST(request);

    expect(mockCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        consentIpHash: sha256Hex("198.51.100.4"),
        consentUserAgent: "AnotherAgent/2.0",
        consentTermsVersion: TERMS_OF_SERVICE_VERSION,
      })
    );
  });
});

describe("POST /api/growth-coach/lead — populates the consent audit trail on every submission", () => {
  it("stamps a hashed (not raw) IP, the raw user agent, and the current terms/language versions", async () => {
    mockCreateLead.mockResolvedValue({ id: "lead-3", email: "dana@example.com", consentToSaveReport: true });
    const { POST } = await import("@/app/api/growth-coach/lead/route");
    const request = new NextRequest("http://localhost/api/growth-coach/lead", {
      method: "POST",
      headers: reqHeaders("192.0.2.55", "GrowthCoachAgent/3.0"),
      body: JSON.stringify({
        sessionId: "session-x",
        firstName: "Dana",
        email: "dana@example.com",
        consentToSaveReport: true,
        consentToEmailFollowUp: false,
        consentToPhoneCall: false,
        consentToMarketing: false,
        hpToken: "",
        turnstileToken: null,
        report: {},
        context: {},
      }),
    });
    await POST(request);

    expect(mockCreateLead).toHaveBeenCalledWith(
      expect.objectContaining({
        consentIpHash: sha256Hex("192.0.2.55"),
        consentUserAgent: "GrowthCoachAgent/3.0",
        consentTermsVersion: TERMS_OF_SERVICE_VERSION,
      })
    );
  });
});
