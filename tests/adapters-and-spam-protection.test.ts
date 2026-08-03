import { afterEach, describe, expect, it, vi } from "vitest";

describe("Adapter factories fall back safely when unconfigured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("getEmailAdapter() returns the console mock when RESEND_API_KEY/EMAIL_FROM_ADDRESS are unset", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "");
    const { getEmailAdapter, isEmailDeliveryActive } = await import("@/lib/growth-coach/adapters");
    const { consoleEmailAdapter } = await import("@/lib/growth-coach/adapters/local-mock");
    expect(isEmailDeliveryActive()).toBe(false);
    expect(getEmailAdapter()).toBe(consoleEmailAdapter);
  });

  it("getEmailAdapter() switches to Resend once both env vars are set", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM_ADDRESS", "reports@example.com");
    const { getEmailAdapter, isEmailDeliveryActive } = await import("@/lib/growth-coach/adapters");
    const { resendEmailAdapter } = await import("@/lib/growth-coach/adapters/resend");
    expect(isEmailDeliveryActive()).toBe(true);
    expect(getEmailAdapter()).toBe(resendEmailAdapter);
  });

  it("getLeadAdapter() returns the in-memory store when Supabase env vars are unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const { getLeadAdapter, isDurableStorageActive } = await import("@/lib/growth-coach/adapters");
    const { localLeadAdapter } = await import("@/lib/growth-coach/adapters/local-mock");
    expect(isDurableStorageActive()).toBe(false);
    expect(getLeadAdapter()).toBe(localLeadAdapter);
  });

  it("getLeadAdapter() switches to Supabase once both env vars are set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
    const { getLeadAdapter, isDurableStorageActive } = await import("@/lib/growth-coach/adapters");
    const { supabaseLeadAdapter } = await import("@/lib/growth-coach/adapters/supabase");
    expect(isDurableStorageActive()).toBe(true);
    expect(getLeadAdapter()).toBe(supabaseLeadAdapter);
  });
});

describe("Turnstile verification no-ops safely when unconfigured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("passes every submission when TURNSTILE_SECRET_KEY is unset, even with no token", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const { verifyTurnstileToken, isTurnstileConfigured } = await import("@/lib/growth-coach/spam-protection");
    expect(isTurnstileConfigured()).toBe(false);
    const result = await verifyTurnstileToken(undefined, "127.0.0.1");
    expect(result.ok).toBe(true);
  });

  it("rejects a missing token once TURNSTILE_SECRET_KEY is set", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-test-key");
    const { verifyTurnstileToken, isTurnstileConfigured } = await import("@/lib/growth-coach/spam-protection");
    expect(isTurnstileConfigured()).toBe(true);
    const result = await verifyTurnstileToken(undefined, "127.0.0.1");
    expect(result.ok).toBe(false);
  });
});
