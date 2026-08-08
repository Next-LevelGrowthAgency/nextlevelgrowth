import { afterEach, describe, expect, it, vi } from "vitest";
import type { PortalProfile } from "@/lib/auth/portal-session";

const mockGetPortalSession = vi.fn();
vi.mock("@/lib/auth/portal-session", () => ({
  getPortalSession: () => mockGetPortalSession(),
}));

const mockRecordAuditEvent = vi.fn();
vi.mock("@/lib/growth-coach/audit", () => ({
  recordAuditEvent: (...args: unknown[]) => mockRecordAuditEvent(...args),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockIsSupabaseConfigured = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

function chainable(result: { error: unknown }) {
  const builder: { eq: ReturnType<typeof vi.fn>; then: (resolve: (v: unknown) => void) => void } = {
    eq: vi.fn(() => builder),
    then: (resolve) => resolve(result),
  };
  return builder;
}

vi.mock("@/lib/growth-coach/adapters/supabase-client", () => ({
  isSupabaseConfigured: () => mockIsSupabaseConfigured(),
  getServiceRoleClient: () => ({ from: mockFrom }),
}));

function fakeSession(overrides: Partial<PortalProfile> = {}): PortalProfile {
  return {
    id: "user-1",
    email: "prospect@example.com",
    fullName: "Prospect Person",
    businessName: null,
    phone: null,
    role: "prospect",
    roleRequestStatus: "none",
    roleRequestedAt: null,
    roleRequestNote: null,
    ...overrides,
  };
}

afterEach(() => {
  vi.resetAllMocks();
  mockFrom.mockImplementation(() => ({ update: mockUpdate }));
  mockUpdate.mockImplementation(() => chainable({ error: null }));
});

describe("requestClientAccess", () => {
  it("rejects when there is no session", async () => {
    mockGetPortalSession.mockResolvedValue(null);
    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(new FormData());
    expect(result).toEqual({ ok: false, message: "Your session has expired. Please log in again." });
  });

  it("rejects when the account isn't a 'prospect' (e.g. already a client)", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession({ role: "client" }));
    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(new FormData());
    expect(result.ok).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("rejects a second request while one is already pending", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession({ roleRequestStatus: "pending" }));
    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(new FormData());
    expect(result.ok).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("rejects when Supabase isn't configured", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession());
    mockIsSupabaseConfigured.mockReturnValue(false);
    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(new FormData());
    expect(result.ok).toBe(false);
  });

  it("on success, writes role_request_status='pending' scoped to this user's id AND role='prospect', never trusting a client-supplied status", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession({ id: "user-42" }));
    mockIsSupabaseConfigured.mockReturnValue(true);
    const form = new FormData();
    form.set("note", "Interested in ongoing SEO work.");
    // A hostile caller could try to inject a status via the form — the
    // action must ignore it and always write 'pending' itself.
    form.set("role_request_status", "approved");

    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(form);

    expect(result).toEqual({ ok: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role_request_status: "pending", role_request_note: "Interested in ongoing SEO work." })
    );
    const chain = mockUpdate.mock.results[0].value;
    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "user-42");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "role", "prospect");
    expect(mockRecordAuditEvent).toHaveBeenCalledWith("client_access_requested", "unknown", expect.objectContaining({ detail: expect.stringContaining("user-42") }));
  });

  it("trims and caps the note at 500 characters, and stores null (not an empty string) when blank", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession());
    mockIsSupabaseConfigured.mockReturnValue(true);
    const form = new FormData();
    form.set("note", "   ");
    const { requestClientAccess } = await import("@/app/portal/actions");
    await requestClientAccess(form);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ role_request_note: null }));

    mockUpdate.mockClear();
    const longForm = new FormData();
    longForm.set("note", "x".repeat(1000));
    await requestClientAccess(longForm);
    const written = mockUpdate.mock.calls[0][0].role_request_note as string;
    expect(written.length).toBe(500);
  });

  it("returns a generic failure message (not a stack trace) when the write errors", async () => {
    mockGetPortalSession.mockResolvedValue(fakeSession());
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockUpdate.mockImplementation(() => chainable({ error: { message: "db exploded" } }));
    const { requestClientAccess } = await import("@/app/portal/actions");
    const result = await requestClientAccess(new FormData());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).not.toContain("db exploded");
  });
});
