import { afterEach, describe, expect, it, vi } from "vitest";
import type { EffectiveAdminSession } from "@/lib/auth/admin-session";

const mockGetEffectiveAdminSession = vi.fn();
vi.mock("@/lib/auth/admin-session", () => ({
  getEffectiveAdminSession: () => mockGetEffectiveAdminSession(),
}));

const mockRecordAuditEvent = vi.fn();
vi.mock("@/lib/growth-coach/audit", () => ({
  recordAuditEvent: (...args: unknown[]) => mockRecordAuditEvent(...args),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockIsSupabaseConfigured = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

function chainable(result: { error: unknown; count?: number | null }) {
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

const authorizedSession: Extract<EffectiveAdminSession, { authorized: true }> = {
  authenticated: true,
  authorized: true,
  role: "admin",
  source: "supabase",
  userId: "admin-1",
  email: "owner@example.com",
};

afterEach(() => {
  vi.resetAllMocks();
  mockFrom.mockImplementation(() => ({ update: mockUpdate }));
  mockUpdate.mockImplementation(() => chainable({ error: null, count: 1 }));
  mockIsSupabaseConfigured.mockReturnValue(true);
});

describe("reviewClientAccessRequest — authorization", () => {
  it("throws UNAUTHORIZED and never touches the database when not authenticated", async () => {
    mockGetEffectiveAdminSession.mockResolvedValue({ authenticated: false, source: "supabase" });
    const { reviewClientAccessRequest } = await import("@/app/admin/(protected)/users/actions");
    await expect(reviewClientAccessRequest("user-1", true)).rejects.toThrow("UNAUTHORIZED");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("throws UNAUTHORIZED for an authenticated but non-owner/admin session (e.g. a 'client' trying to approve their own request)", async () => {
    mockGetEffectiveAdminSession.mockResolvedValue({ authenticated: true, authorized: false, role: "client", source: "supabase" });
    const { reviewClientAccessRequest } = await import("@/app/admin/(protected)/users/actions");
    await expect(reviewClientAccessRequest("user-1", true)).rejects.toThrow("UNAUTHORIZED");
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe("reviewClientAccessRequest — approve", () => {
  afterEach(() => {
    mockGetEffectiveAdminSession.mockResolvedValue(authorizedSession);
  });

  it("sets role='client' and role_request_status='approved', scoped to a currently-pending request only", async () => {
    mockGetEffectiveAdminSession.mockResolvedValue(authorizedSession);
    const { reviewClientAccessRequest } = await import("@/app/admin/(protected)/users/actions");
    const result = await reviewClientAccessRequest("user-42", true);

    expect(result).toEqual({ ok: true, message: "Approved — this user is now a client." });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ role: "client", role_request_status: "approved", role_reviewed_by: "admin-1" }),
      { count: "exact" }
    );
    const chain = mockUpdate.mock.results[0].value;
    expect(chain.eq).toHaveBeenNthCalledWith(1, "id", "user-42");
    expect(chain.eq).toHaveBeenNthCalledWith(2, "role_request_status", "pending");
    expect(mockRecordAuditEvent).toHaveBeenCalledWith("role_changed", "admin", expect.objectContaining({ detail: expect.stringContaining("user-42") }));
  });

  it("reports failure (not success) when there was no matching pending request — e.g. already reviewed by someone else", async () => {
    mockGetEffectiveAdminSession.mockResolvedValue(authorizedSession);
    mockUpdate.mockImplementation(() => chainable({ error: null, count: 0 }));
    const { reviewClientAccessRequest } = await import("@/app/admin/(protected)/users/actions");
    const result = await reviewClientAccessRequest("user-42", true);
    expect(result.ok).toBe(false);
    expect(mockRecordAuditEvent).not.toHaveBeenCalled();
  });
});

describe("reviewClientAccessRequest — deny", () => {
  it("sets role_request_status='denied' and does NOT touch role", async () => {
    mockGetEffectiveAdminSession.mockResolvedValue(authorizedSession);
    const { reviewClientAccessRequest } = await import("@/app/admin/(protected)/users/actions");
    const result = await reviewClientAccessRequest("user-7", false);

    expect(result).toEqual({ ok: true, message: "Request denied." });
    const payload = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("role");
    expect(payload.role_request_status).toBe("denied");
    expect(mockRecordAuditEvent).toHaveBeenCalledWith("client_access_denied", "admin", expect.any(Object));
  });
});
