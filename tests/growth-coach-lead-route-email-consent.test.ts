import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LeadProfile } from "@/types";

/**
 * REGRESSION: found during a Stage 4 audit (not by inspection alone) —
 * GrowthCoachLeadForm.tsx's "Save and send me this report by email" is the
 * REQUIRED checkbox, explicitly labeled "This is required to deliver the
 * report you requested." The route, however, used to gate the actual
 * report-delivery send on `consentToEmailFollowUp` (the OPTIONAL "Email —
 * additional follow-up beyond this report" checkbox) instead of
 * `consentToSaveReport`. Since consentToSaveReport is enforced server-side
 * as always-true (lead-schema.ts), the effect was silent: a visitor who
 * left the optional follow-up box unchecked never got the report their
 * required checkbox explicitly promised, with no visible error either to
 * them (emailStatus only distinguishes "not configured" from "sent") or to
 * the owner. These tests pin the correct gating condition directly at the
 * route level, the way the chat route's validation-ordering regression
 * test does, since this is specifically about which condition the ROUTE
 * checks, not something a template/schema unit test alone would catch.
 */

function fakeLead(overrides: Partial<LeadProfile> = {}): LeadProfile {
  return {
    id: "lead-1",
    sessionId: "session-1",
    source: "growth-coach",
    firstName: "Dana",
    email: "dana@example.com",
    businessName: "Dana's Bakery",
    consentToSaveReport: true,
    consentToContact: false,
    consentToEmailFollowUp: false,
    consentToPhoneCall: false,
    consentToTextMessage: false,
    consentToMarketing: false,
    consultationRequested: false,
    ninetyDayPlanRequested: false,
    followUpStatus: "new",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

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
  isEmailDeliveryActive: () => true,
  isDurableStorageActive: () => true,
}));

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    sessionId: "session-1",
    firstName: "Dana",
    email: "dana@example.com",
    consentToSaveReport: true,
    consentToEmailFollowUp: false,
    consentToPhoneCall: false,
    consentToTextMessage: false,
    consentToMarketing: false,
    hpToken: "",
    turnstileToken: null,
    report: {},
    context: {},
    ...overrides,
  };
}

function post(body: unknown) {
  return new NextRequest("http://localhost/api/growth-coach/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/growth-coach/lead — report email is gated on consentToSaveReport, not consentToEmailFollowUp", () => {
  it("sends the report email when consentToSaveReport is true, even if consentToEmailFollowUp is false", async () => {
    mockCreateLead.mockResolvedValue(fakeLead({ consentToSaveReport: true, consentToEmailFollowUp: false }));
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-1" });
    const { POST } = await import("@/app/api/growth-coach/lead/route");

    const response = await POST(post(validBody({ consentToSaveReport: true, consentToEmailFollowUp: false })));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emailStatus).toBe("sent");
    expect(mockSendTransactional).toHaveBeenCalledWith(expect.objectContaining({ to: "dana@example.com" }));
    expect(mockRecordEmailEvent).toHaveBeenCalledWith(expect.objectContaining({ emailType: "visitor_confirmation", status: "sent" }));
  });

  it("still sends the report email when the optional follow-up checkbox is checked too (never a regression the other direction)", async () => {
    mockCreateLead.mockResolvedValue(fakeLead({ consentToSaveReport: true, consentToEmailFollowUp: true }));
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-2" });
    const { POST } = await import("@/app/api/growth-coach/lead/route");

    const response = await POST(post(validBody({ consentToSaveReport: true, consentToEmailFollowUp: true })));
    const data = await response.json();

    expect(data.emailStatus).toBe("sent");
  });

  it("skips the report email when the lead has no email on file, regardless of consent (the internal owner notification still sends)", async () => {
    mockCreateLead.mockResolvedValue(fakeLead({ email: undefined, consentToSaveReport: true }));
    mockSendTransactional.mockResolvedValue({ ok: true, previewId: "email-internal" });
    const { POST } = await import("@/app/api/growth-coach/lead/route");

    const response = await POST(post(validBody()));
    const data = await response.json();

    expect(data.emailStatus).toBe("skipped");
    expect(mockRecordEmailEvent).not.toHaveBeenCalledWith(expect.objectContaining({ emailType: "visitor_confirmation" }));
  });
});
