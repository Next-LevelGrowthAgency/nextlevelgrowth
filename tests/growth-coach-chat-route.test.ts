import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

/**
 * REGRESSION: found live (via manual curl against the dev server, not by
 * inspection) — the route originally checked isAnthropicConfigured()
 * BEFORE validating the request body, so a malformed request (empty
 * messages array, or a history that doesn't end with a user turn) was
 * silently swallowed as the graceful "not_configured" response instead of
 * a real 400. Validation must always run first: a client bug is a client
 * bug regardless of whether the AI happens to be configured.
 *
 * This is the one route in the test suite tested directly rather than
 * through its underlying lib function — the bug was specifically about
 * the ORDER of two checks inside the route handler itself, which no
 * amount of unit-testing callGrowthCoachAi() in isolation would catch.
 */

vi.mock("@/lib/growth-coach/ai/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/growth-coach/ai/config")>();
  return { ...actual, isAnthropicConfigured: () => false };
});

function post(body: unknown) {
  const request = new NextRequest("http://localhost/api/growth-coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return request;
}

describe("POST /api/growth-coach/chat — validation runs before the configuration check", () => {
  it("returns a real 400 invalid_request for an empty messages array, not not_configured", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [] }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toEqual({ ok: false, reason: "invalid_request" });
  });

  it("returns a real 400 invalid_request when the last message isn't from the user, not not_configured", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "assistant", content: "hi" }] }));
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toEqual({ ok: false, reason: "invalid_request" });
  });

  it("returns a real 400 invalid_request for a missing messages field", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({}));
    expect(response.status).toBe(400);
  });

  it("only reaches the graceful not_configured response for an otherwise well-formed request", async () => {
    const { POST } = await import("@/app/api/growth-coach/chat/route");
    const response = await POST(post({ messages: [{ role: "user", content: "How do I get more leads?" }] }));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: false, reason: "not_configured" });
  });
});
