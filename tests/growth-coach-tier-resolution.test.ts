import { afterEach, describe, expect, it, vi } from "vitest";

const mockGetCurrentUserRoleInfo = vi.fn();

vi.mock("@/lib/auth/portal-session", () => ({
  getCurrentUserRoleInfo: mockGetCurrentUserRoleInfo,
}));

/**
 * resolveRequestTier() is the single mapping from "who is making this
 * request" to "which usage tier and budget pool it counts against" — a
 * mistake here would either let a guest slip into a higher-limit pool or
 * wrongly cap a paying client, so every branch of the guest/free/client
 * decision gets its own assertion.
 */
describe("resolveRequestTier", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is 'guest' in the 'free' pool for an anonymous visitor, with a hashed (not raw) identity", async () => {
    mockGetCurrentUserRoleInfo.mockResolvedValue(null);
    const { resolveRequestTier, hashGuestIdentity } = await import("@/lib/growth-coach/ai/tier");
    const result = await resolveRequestTier("203.0.113.7");
    expect(result.tier).toBe("guest");
    expect(result.pool).toBe("free");
    expect(result.userId).toBeNull();
    expect(result.identityHash).toBe(hashGuestIdentity("203.0.113.7"));
    expect(result.identityKey).toBe(hashGuestIdentity("203.0.113.7"));
    expect(result.identityHash).not.toBe("203.0.113.7");
  });

  it("hashGuestIdentity is deterministic for the same IP and differs for different IPs", async () => {
    const { hashGuestIdentity } = await import("@/lib/growth-coach/ai/tier");
    expect(hashGuestIdentity("1.2.3.4")).toBe(hashGuestIdentity("1.2.3.4"));
    expect(hashGuestIdentity("1.2.3.4")).not.toBe(hashGuestIdentity("5.6.7.8"));
  });

  it("is 'client' in the 'client' pool for a signed-in visitor with role 'client'", async () => {
    mockGetCurrentUserRoleInfo.mockResolvedValue({ id: "user-client-1", role: "client" });
    const { resolveRequestTier } = await import("@/lib/growth-coach/ai/tier");
    const result = await resolveRequestTier("203.0.113.7");
    expect(result).toEqual({ tier: "client", pool: "client", identityKey: "user-client-1", userId: "user-client-1", identityHash: null });
  });

  it.each(["prospect", "team", "admin", "owner"] as const)("is 'free' in the 'free' pool for a signed-in visitor with role '%s'", async (role) => {
    mockGetCurrentUserRoleInfo.mockResolvedValue({ id: "user-1", role });
    const { resolveRequestTier } = await import("@/lib/growth-coach/ai/tier");
    const result = await resolveRequestTier("203.0.113.7");
    expect(result).toEqual({ tier: "free", pool: "free", identityKey: "user-1", userId: "user-1", identityHash: null });
  });
});
