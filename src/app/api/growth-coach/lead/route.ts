import { getEmailAdapter, getLeadAdapter, isDurableStorageActive, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { generateSubmissionId, type SubmissionResponse } from "@/lib/api/submission-response";
import { buildInternalLeadEmail, buildInternalLeadEmailSubject, buildVisitorReportEmail } from "@/lib/growth-coach/email-templates";
import { buildLeadInput, buildOwnerSummary, type LeadFormValues } from "@/lib/growth-coach/lead-profile";
import { leadSubmissionSchema } from "@/lib/growth-coach/lead-schema";
import { containsSensitiveData } from "@/lib/growth-coach/sensitive-data";
import { CONSENT_LANGUAGE_VERSION } from "@/lib/consent";
import { getCurrentUserId } from "@/lib/auth/portal-session";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { verifyTurnstileToken } from "@/lib/growth-coach/spam-protection";
import type { BusinessGrowthReport, CoachContext } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 100_000; // larger than the other two routes: this payload also carries the full report/context JSON

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
 *
 * IMPORTANT: the database write is wrapped in its own try/catch and
 * returns DATABASE_ERROR on failure — an unconfigured or unreachable
 * Supabase instance must never be reported to the visitor as "ok" (see
 * safety rule #18). Email failures, by contrast, never fail the request:
 * the lead is already durably saved by that point, so the response stays
 * `ok: true` with `emailStatus: "failed"`.
 */
function json(body: SubmissionResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const submissionId = generateSubmissionId("lead");

  if (isRateLimited("growth-coach-lead", ip, 60_000, 8)) {
    return json({ ok: false, code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." }, 429);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false, code: "VALIDATION_ERROR", message: "Unexpected request format. Please refresh the page and try again." }, 400);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return json({ ok: false, code: "VALIDATION_ERROR", message: "Request too large." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check your entries and try again." }, 400);
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return json({ ok: false, code: "VALIDATION_ERROR", message: "Please check the highlighted fields and try again.", fieldErrors }, 400);
  }
  const data = parsed.data;

  // Honeypot: a real visitor never fills this field.
  if (data.hpToken) {
    console.warn(`[growth-coach-lead] Honeypot triggered, submission ${submissionId} rejected as spam.`);
    return json({ ok: false, code: "SPAM_REJECTED", message: "Submission rejected." }, 400);
  }

  const turnstile = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!turnstile.ok) {
    return json({ ok: false, code: "SPAM_REJECTED", message: "Spam check failed. Please reload and try again." }, 400);
  }

  for (const field of [data.businessName, data.cityState, data.websiteUrl, data.phone]) {
    if (field && containsSensitiveData(field)) {
      return json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "One of your fields looks like it may contain sensitive information (like a password or ID number). Please remove it and try again.",
        },
        400
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

  const leadInput = {
    ...buildLeadInput(formValues, data.report as unknown as BusinessGrowthReport, data.context as unknown as CoachContext, data.sessionId),
    userId: await getCurrentUserId(),
    consentLanguageVersion: CONSENT_LANGUAGE_VERSION,
    sourcePage: data.sourcePage,
    referrer: data.referrer,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
  };

  const leadAdapter = getLeadAdapter();
  const emailAdapter = getEmailAdapter();

  // The database write is the one step that MUST succeed for this route to
  // report success at all — never claim a lead was saved when it wasn't.
  let lead;
  try {
    lead = await leadAdapter.createLead(leadInput);
  } catch (error) {
    console.error(`[growth-coach-lead] ${submissionId}: Database write failed:`, error instanceof Error ? error.message : error);
    return json(
      {
        ok: false,
        code: "DATABASE_ERROR",
        message: "We couldn't save your information just now. Please try again in a moment — nothing was lost on your end.",
        submissionId,
      },
      503
    );
  }

  const ownerSummary = buildOwnerSummary(lead);

  // Transcript — best-effort, never blocks the response.
  if (data.messages && data.messages.length > 0) {
    await leadAdapter.saveConversationTranscript({
      leadId: lead.id,
      businessPath: data.businessPath ?? null,
      responseDepth: data.responseDepth ?? null,
      summary: lead.conversationSummary ?? null,
      messages: data.messages,
    });
  }

  // Internal notification — the lead is already saved at this point, so an
  // email-provider failure here never loses the submission itself. Errors
  // are logged server-side, not surfaced as a failure to the visitor.
  if (isEmailDeliveryActive()) {
    const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email;
    try {
      const internal = buildInternalLeadEmail(lead, ownerSummary);
      const result = await emailAdapter.sendTransactional({
        to: notifyTo,
        replyTo: lead.email,
        subject: buildInternalLeadEmailSubject(lead),
        body: internal.text,
        html: internal.html,
      });
      await leadAdapter.recordEmailEvent({ leadId: lead.id, emailType: "internal_notification", recipient: notifyTo, status: "sent", providerMessageId: result.previewId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[growth-coach-lead] ${submissionId}: Internal notification email failed:`, message);
      await leadAdapter.recordEmailEvent({ leadId: lead.id, emailType: "internal_notification", recipient: notifyTo, status: "failed", errorMessage: message });
    }
  }

  // Visitor's personalized plan — never includes internal lead-scoring
  // labels, sales-qualification tiers, or private notes (see
  // buildVisitorReportEmail's doc comment). Only sent when email-follow-up
  // consent was actually given, per the "consent-aware confirmation" rule.
  let emailStatus: "sent" | "skipped" | "failed" = "skipped";
  if (lead.email && lead.consentToEmailFollowUp !== false && isEmailDeliveryActive()) {
    try {
      const visitor = buildVisitorReportEmail(lead);
      const result = await emailAdapter.sendTransactional({ to: lead.email, subject: visitor.subject, body: visitor.text, html: visitor.html });
      emailStatus = "sent";
      await leadAdapter.recordEmailEvent({ leadId: lead.id, emailType: "visitor_confirmation", recipient: lead.email, status: "sent", providerMessageId: result.previewId });
    } catch (error) {
      emailStatus = "failed";
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[growth-coach-lead] ${submissionId}: Visitor report email failed:`, message);
      await leadAdapter.recordEmailEvent({ leadId: lead.id, emailType: "visitor_confirmation", recipient: lead.email, status: "failed", errorMessage: message });
    }
  }

  if (!isEmailDeliveryActive()) {
    console.warn(`[growth-coach-lead] ${submissionId}: RESEND_API_KEY/EMAIL_FROM_ADDRESS not set — lead saved, email logged to console only. See .env.example.`);
  }
  if (!isDurableStorageActive()) {
    console.warn(`[growth-coach-lead] ${submissionId}: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set — lead saved to the in-memory store only, not a durable database. See .env.example.`);
  }

  return json(
    {
      ok: true,
      submissionId,
      message:
        emailStatus === "failed"
          ? "Your request was received. We had a temporary notification issue, but your information was saved."
          : "Saved. Your report has been recorded.",
      emailStatus,
    },
    200
  );
}
