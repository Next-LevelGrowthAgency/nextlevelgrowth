import { getEmailAdapter, getLeadAdapter, isDurableStorageActive, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { buildInternalLeadEmail, buildInternalLeadEmailSubject, buildVisitorReportEmail } from "@/lib/growth-coach/email-templates";
import { buildLeadInput, buildOwnerSummary, type LeadFormValues } from "@/lib/growth-coach/lead-profile";
import { leadSubmissionSchema } from "@/lib/growth-coach/lead-schema";
import { containsSensitiveData } from "@/lib/growth-coach/sensitive-data";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { verifyTurnstileToken } from "@/lib/growth-coach/spam-protection";
import type { BusinessGrowthReport, CoachContext } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Validated, rate-limited lead-capture endpoint for the Growth Coach's
 * "save & send my report" flow.
 *
 * Persistence and email delivery both go through adapter factories
 * (getLeadAdapter()/getEmailAdapter() — see ./adapters/index.ts) that pick
 * the real provider only when it's fully configured via environment
 * variables, and fall back to the in-memory store / console-logged email
 * otherwise — so the app never silently loses a submission, and this route
 * never needs to change as providers come online.
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

  const turnstile = await verifyTurnstileToken((body as Record<string, unknown>).turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json({ error: "Spam check failed. Please reload and try again." }, { status: 400 });
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
    consentToEmailFollowUp: data.consentToEmailFollowUp,
    consentToPhoneCall: data.consentToPhoneCall,
    consentToTextMessage: data.consentToTextMessage,
    consentToMarketing: data.consentToMarketing,
    consultationRequested: data.consultationRequested,
  };

  const leadInput = buildLeadInput(
    formValues,
    data.report as unknown as BusinessGrowthReport,
    data.context as unknown as CoachContext,
    data.sessionId
  );

  const leadAdapter = getLeadAdapter();
  const emailAdapter = getEmailAdapter();

  const lead = await leadAdapter.createLead(leadInput);
  const ownerSummary = buildOwnerSummary(lead);

  // Internal notification — the lead is already saved at this point, so an
  // email-provider failure here never loses the submission itself. Errors
  // are logged server-side, not surfaced to the visitor.
  let internalEmailSent = false;
  try {
    const internal = buildInternalLeadEmail(lead, ownerSummary);
    await emailAdapter.sendTransactional({
      to: process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email,
      subject: buildInternalLeadEmailSubject(lead),
      body: internal.text,
      html: internal.html,
    });
    internalEmailSent = true;
  } catch (error) {
    console.error("[growth-coach-lead] Internal notification email failed:", error instanceof Error ? error.message : error);
  }

  // Visitor's personalized plan — never includes internal lead-scoring
  // labels, sales-qualification tiers, or private notes (see
  // buildVisitorReportEmail's doc comment).
  let visitorEmailSent = false;
  if (lead.email) {
    try {
      const visitor = buildVisitorReportEmail(lead);
      await emailAdapter.sendTransactional({ to: lead.email, subject: visitor.subject, body: visitor.text, html: visitor.html });
      visitorEmailSent = true;
    } catch (error) {
      console.error("[growth-coach-lead] Visitor report email failed:", error instanceof Error ? error.message : error);
    }
  }

  if (!isEmailDeliveryActive()) {
    console.warn("[growth-coach-lead] RESEND_API_KEY/EMAIL_FROM_ADDRESS not set — lead saved, email logged to console only. See .env.example.");
  }
  if (!isDurableStorageActive()) {
    console.warn("[growth-coach-lead] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set — lead saved to the in-memory store only, not a durable database. See .env.example.");
  }

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    emailSent: visitorEmailSent,
    internalEmailSent,
  });
}
