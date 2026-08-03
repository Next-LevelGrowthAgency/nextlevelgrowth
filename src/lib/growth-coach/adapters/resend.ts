import { Resend } from "resend";
import type { EmailAdapter, OutboundEmail } from "./types";

/**
 * PRODUCTION EMAIL ADAPTER — active only once RESEND_API_KEY and
 * EMAIL_FROM_ADDRESS are both set (see isResendConfigured() and
 * ./index.ts's factory, which falls back to the console mock otherwise).
 * Requires a Resend account with a verified sending domain — see the
 * completion report for exact setup steps. Never import this module for
 * its side effects alone; the Resend client is only constructed lazily,
 * inside getClient(), so an unconfigured environment never throws at
 * import time.
 */

let client: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set. See .env.example.");
  if (!client) client = new Resend(apiKey);
  return client;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM_ADDRESS);
}

export const resendEmailAdapter: EmailAdapter = {
  async sendTransactional(email: OutboundEmail) {
    const from = process.env.EMAIL_FROM_ADDRESS;
    if (!from) throw new Error("EMAIL_FROM_ADDRESS is not set. See .env.example.");

    const result = await getClient().emails.send({
      from,
      to: email.to,
      subject: email.subject,
      html: email.html ?? `<pre style="white-space:pre-wrap;font-family:inherit;">${email.body}</pre>`,
      text: email.body,
    });

    if (result.error) {
      throw new Error(`Resend send failed: ${result.error.message}`);
    }
    return { ok: true as const, previewId: result.data?.id ?? "unknown" };
  },

  async enqueueSequence(leadId: string, sequenceId: string) {
    // No marketing-sequence provider is connected in this phase — Resend
    // is wired for transactional sends only (internal notification +
    // visitor report). Marketing consent is still recorded on the lead
    // (see lead-profile.ts) so a real sequence tool (Resend Broadcasts,
    // a CRM, etc.) can be connected later without a data-model change.
    console.info(`[resend-adapter] Marketing sequence enqueue requested (lead ${leadId}, sequence ${sequenceId}) — no sequence provider connected yet.`);
    return { ok: true as const };
  },
};
