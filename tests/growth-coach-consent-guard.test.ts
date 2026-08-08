import { afterEach, describe, expect, it, vi } from "vitest";
import type { LeadProfile } from "@/types";

const mockSendTransactional = vi.fn();
vi.mock("@/lib/growth-coach/adapters", () => ({
  getEmailAdapter: () => ({ sendTransactional: mockSendTransactional }),
}));

function fakeLead(overrides: Partial<LeadProfile> = {}): LeadProfile {
  return {
    id: "lead-1",
    sessionId: "session-1",
    source: "growth-coach",
    consentToSaveReport: true,
    consentToContact: false,
    consentToEmailFollowUp: false,
    consentToPhoneCall: false,
    consentToMarketing: false,
    followUpStatus: "new",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

/**
 * assertConsent()/sendToConsentedChannel() are the structural rule from
 * the consent-system hardening: any future email/text/call feature MUST
 * obtain a ConsentProof before contacting a lead. These tests pin the
 * per-channel mapping to the actual LeadProfile boolean it checks — a
 * wrong mapping here (e.g. "text" checking consentToPhoneCall) would
 * silently defeat the whole point of the guard.
 */
describe("assertConsent", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    ["report", "consentToSaveReport"],
    ["emailFollowUp", "consentToEmailFollowUp"],
    ["phone", "consentToPhoneCall"],
    ["marketing", "consentToMarketing"],
  ] as const)("returns a proof for channel '%s' when %s is true", async (channel, field) => {
    const { assertConsent } = await import("@/lib/growth-coach/consent-guard");
    const lead = fakeLead({ [field]: true } as Partial<LeadProfile>);
    expect(assertConsent(lead, channel)).toEqual({ leadId: "lead-1", channel });
  });

  it.each([
    ["report", "consentToSaveReport"],
    ["emailFollowUp", "consentToEmailFollowUp"],
    ["phone", "consentToPhoneCall"],
    ["marketing", "consentToMarketing"],
  ] as const)("throws ConsentNotGrantedError for channel '%s' when %s is false", async (channel, field) => {
    const { assertConsent, ConsentNotGrantedError } = await import("@/lib/growth-coach/consent-guard");
    const lead = fakeLead({ [field]: false } as Partial<LeadProfile>);
    expect(() => assertConsent(lead, channel)).toThrow(ConsentNotGrantedError);
  });

  it("there is no 'text' channel anymore (removed — no texting feature exists) — an unrecognized channel value denies by default rather than silently allowing", async () => {
    const { assertConsent, ConsentNotGrantedError } = await import("@/lib/growth-coach/consent-guard");
    const lead = fakeLead({ consentToPhoneCall: true, consentToEmailFollowUp: true, consentToMarketing: true });
    // "text" is no longer a valid ConsentChannel at the type level — cast
    // to simulate a caller that still has a stale reference to it (e.g. an
    // old build, a dynamic string) reaching this function at runtime.
    expect(() => assertConsent(lead, "text" as unknown as Parameters<typeof assertConsent>[1])).toThrow(ConsentNotGrantedError);
  });

  it("throws for the two contact channels even when a DIFFERENT contact channel was granted — no cross-channel leakage", async () => {
    const { assertConsent, ConsentNotGrantedError } = await import("@/lib/growth-coach/consent-guard");
    const lead = fakeLead({ consentToPhoneCall: true, consentToEmailFollowUp: false });
    expect(() => assertConsent(lead, "emailFollowUp")).toThrow(ConsentNotGrantedError);
    expect(assertConsent(lead, "phone")).toEqual({ leadId: "lead-1", channel: "phone" });
  });

  it("the thrown error names the lead and the channel", async () => {
    const { assertConsent, ConsentNotGrantedError } = await import("@/lib/growth-coach/consent-guard");
    const lead = fakeLead({ consentToMarketing: false, id: "lead-42" });
    try {
      assertConsent(lead, "marketing");
      throw new Error("expected assertConsent to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ConsentNotGrantedError);
      const consentError = error as InstanceType<typeof ConsentNotGrantedError>;
      expect(consentError.leadId).toBe("lead-42");
      expect(consentError.channel).toBe("marketing");
      expect(consentError.message).toContain("lead-42");
      expect(consentError.message).toContain("marketing");
    }
  });
});

describe("sendToConsentedChannel", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("requires a real ConsentProof (obtained via assertConsent) and forwards the send to the email adapter", async () => {
    const { assertConsent, sendToConsentedChannel } = await import("@/lib/growth-coach/consent-guard");
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-1" });
    const lead = fakeLead({ consentToSaveReport: true });

    const proof = assertConsent(lead, "report");
    const result = await sendToConsentedChannel(proof, { to: "dana@example.com", subject: "Your plan", body: "text body" });

    expect(result).toEqual({ ok: true, previewId: "email-1" });
    expect(mockSendTransactional).toHaveBeenCalledWith({ to: "dana@example.com", subject: "Your plan", body: "text body" });
  });
});
