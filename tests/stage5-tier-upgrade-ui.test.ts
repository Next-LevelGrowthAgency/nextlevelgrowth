import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf-8");
}

describe("Portal shows account tier and the client-access request path", () => {
  const portalSource = read("src/app/portal/page.tsx");

  it("renders the current role/tier", () => {
    expect(portalSource).toContain("session.role");
    expect(portalSource).toContain("Account tier");
  });

  it("renders the request form only for a 'prospect' without a pending request", () => {
    expect(portalSource).toContain("ClientAccessRequestForm");
    expect(portalSource).toContain('session.role === "prospect"');
  });
});

describe("Admin Users page reviews pending client-access requests, not free-form role editing", () => {
  const usersSource = read("src/app/admin/(protected)/users/page.tsx");

  it("shows pending requests with approve/deny actions", () => {
    expect(usersSource).toContain("reviewClientAccessRequest");
    expect(usersSource).toContain("Approve");
    expect(usersSource).toContain("Deny");
  });

  it("still states that free-form role editing is unavailable — the approval flow is a narrow, single-purpose exception, not a general role editor", () => {
    expect(usersSource.toLowerCase()).toContain("role editing isn");
  });
});

describe("Migration 0007 revokes admin-controlled columns from authenticated, matching the existing revoke(role) pattern", () => {
  const migration = read("supabase/migrations/0007_client_access_requests.sql");

  it("revokes role_request_status, role_reviewed_at, and role_reviewed_by from authenticated", () => {
    expect(migration).toMatch(/revoke update \(role_request_status, role_reviewed_at, role_reviewed_by\) on profiles from authenticated/);
  });
});
