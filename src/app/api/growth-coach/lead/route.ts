import { localLeadAdapter, consoleEmailAdapter } from "@/lib/growth-coach/adapters/local-mock";
import { buildLeadInput, buildOwnerSummary, type LeadFormValues } from "@/lib/growth-coach/lead-profile";
import { leadSubmissionSchema } from "@/lib/growth-coach/lead-schema";
import { containsSensitiveData } from "@/lib/growth-coach/sensitive-data";
import { isRateLimited } from "@/lib/rate-limit";
import type { BusinessGrowthReport, CoachContext } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Validated, rate-limited local lead-capture endpoint for the Growth
 * Coach's "save & send my report" flow.
 *
 * DEVELOPMENT-ONLY: writes to an in-memory mock adapter
 * (src/lib/growth-coach/adapters/local-mock.ts) and "sends" an owner
 * notification through a mock email adapter that only logs to the
 * console — no real database and no real email provider are connected
 * yet. See Phase B recommendations for what's required to go live.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited("growth-coach-lead", ip, 60_000, 8)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json({ error: firstIssue?.message ?? "Please check your entries and try again." }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot: a real visitor never fills this field.
  if (data.companyWebsite2) {
    return NextResponse.json({ error: "Submission rejected." }, { status: 400 });
  }

  for (const field of [data.businessName, data.cityState, data.websiteUrl, data.phone]) {
    if (field && containsSensitiveData(field)) {
      return NextResponse.json(
        { error: "One of your fields looks like it may contain sensitive information (like a password or ID number). Please remove it and try again." },
        { status: 400 }
      );
    }
  }

  const formValues: LeadFormValues = {
    firstName: data.firstName,
    email: data.email,
    businessName: data.businessName || undefined,
    cityState: data.cityState || undefined,
    websiteUrl: data.websiteUrl || undefined,
    phone: data.phone || undefined,
    preferredContactMethod: data.preferredContactMethod,
    consentToSaveReport: data.consentToSaveReport,
    consentToContact: data.consentToContact,
    consentToMarketing: data.consentToMarketing,
    consultationRequested: data.consultationRequested,
  };

  const leadInput = buildLeadInput(
    formValues,
    data.report as unknown as BusinessGrowthReport,
    data.context as unknown as CoachContext,
    data.sessionId
  );

  const lead = await localLeadAdapter.createLead(leadInput);
  const ownerSummary = buildOwnerSummary(lead);

  // Owner notification — mock only, never a real send in this phase.
  await consoleEmailAdapter.sendTransactional({
    to: process.env.EMAIL_TO_ADDRESS || "hello@nextlevelgrowth.com",
    subject: `New Next Level Growth Coach Lead: ${lead.businessName ?? lead.firstName ?? "Unnamed"}`,
    body: JSON.stringify(ownerSummary, null, 2),
  });

  if (!process.env.EMAIL_PROVIDER_API_KEY && !process.env.CRM_API_KEY) {
    console.warn("[growth-coach-lead] No EMAIL_PROVIDER_API_KEY or CRM_API_KEY set — lead was saved locally (mock) only. See .env.example.");
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
