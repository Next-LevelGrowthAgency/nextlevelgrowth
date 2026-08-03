import { generateSubmissionId, type SubmissionResponse } from "@/lib/api/submission-response";
import { getEmailAdapter, getLeadAdapter, isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import { buildContactConfirmationEmail } from "@/lib/growth-coach/email-templates";
import { verifyTurnstileToken } from "@/lib/growth-coach/spam-protection";
import { contactSchema } from "@/lib/contact-schema";
import { CONSENT_LANGUAGE_VERSION } from "@/lib/consent";
import { getCurrentUserId } from "@/lib/auth/portal-session";
import { isRateLimited } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

function json(body: SubmissionResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const submissionId = generateSubmissionId("contact");

  if (isRateLimited("contact", ip, 60_000, 5)) {
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

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Please check the highlighted fields and try again.",
        fieldErrors,
      },
      400
    );
  }
  const data = parsed.data;

  // Honeypot: a real visitor never fills this field.
  if (data.hpToken) {
    console.warn(`[contact] Honeypot triggered, submission ${submissionId} rejected as spam.`);
    return json({ ok: false, code: "SPAM_REJECTED", message: "Submission rejected." }, 400);
  }

  const turnstile = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!turnstile.ok) {
    return json({ ok: false, code: "SPAM_REJECTED", message: "Spam check failed. Please reload and try again." }, 400);
  }

  const leadAdapter = getLeadAdapter();
  const emailAdapter = getEmailAdapter();

  // Best-effort persistence: the contact form's primary contract has
  // always been "we email your message to the team," which still happens
  // below regardless of this outcome — a database hiccup here must not
  // turn a legitimate message into a failed submission. It's still logged
  // loudly so a real outage doesn't go unnoticed.
  let leadId: string | null = null;
  try {
    const lead = await leadAdapter.createLead({
      sessionId: submissionId,
      source: "contact",
      userId: await getCurrentUserId(),
      firstName: data.name,
      email: data.email,
      phone: data.phone,
      businessName: data.companyName,
      message: data.message,
      consentToSaveReport: true,
      consentToContact: true,
      consentToEmailFollowUp: true,
      consentToMarketing: false,
      consentLanguageVersion: CONSENT_LANGUAGE_VERSION,
      sourcePage: data.sourcePage,
      referrer: data.referrer,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      followUpStatus: "new",
    });
    leadId = lead.id;
  } catch (error) {
    console.error(`[contact] ${submissionId}: Database write failed (email will still be sent):`, error instanceof Error ? error.message : error);
  }

  let emailStatus: "sent" | "skipped" | "failed" = "skipped";
  if (isEmailDeliveryActive()) {
    const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL || siteConfig.contact.email;
    try {
      const result = await emailAdapter.sendTransactional({
        to: notifyTo,
        replyTo: data.email,
        subject: `New contact form message from ${data.name}`,
        body: [
          `Submission ID: ${submissionId}`,
          `Name: ${data.name}`,
          `Email: ${data.email}`,
          data.phone ? `Phone: ${data.phone}` : "",
          data.companyName ? `Company: ${data.companyName}` : "",
          "",
          data.message,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      emailStatus = "sent";
      await leadAdapter.recordEmailEvent({ leadId, emailType: "internal_notification", recipient: notifyTo, status: "sent", providerMessageId: result.previewId });
    } catch (error) {
      emailStatus = "failed";
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[contact] ${submissionId}: Notification email failed:`, message);
      await leadAdapter.recordEmailEvent({ leadId, emailType: "internal_notification", recipient: notifyTo, status: "failed", errorMessage: message });
    }

    try {
      const confirmation = buildContactConfirmationEmail(data.name);
      const result = await emailAdapter.sendTransactional({ to: data.email, subject: confirmation.subject, body: confirmation.text, html: confirmation.html });
      await leadAdapter.recordEmailEvent({ leadId, emailType: "visitor_confirmation", recipient: data.email, status: "sent", providerMessageId: result.previewId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[contact] ${submissionId}: Visitor confirmation email failed:`, message);
      await leadAdapter.recordEmailEvent({ leadId, emailType: "visitor_confirmation", recipient: data.email, status: "failed", errorMessage: message });
    }
  } else {
    console.warn(`[contact] ${submissionId}: RESEND_API_KEY/EMAIL_FROM_ADDRESS not set — logged to console only. See .env.example.`);
  }

  return json(
    {
      ok: true,
      submissionId,
      message: "Thanks — your message is in. We'll get back to you shortly.",
      emailStatus,
    },
    200
  );
}
