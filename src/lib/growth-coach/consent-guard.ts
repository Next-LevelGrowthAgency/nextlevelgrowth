import { getEmailAdapter } from "./adapters";
import type { OutboundEmail } from "./adapters/types";
import type { LeadProfile } from "@/types";

/**
 * THE HARD RULE for contacting a lead through any channel they may or may
 * not have consented to: get a ConsentProof by calling assertConsent()
 * before sending/calling/texting — never check a `consentTo*` boolean
 * inline and proceed. This exists specifically so a future SMS or
 * phone-outreach feature can't accidentally skip the check the way the
 * report-email send once did (see the Stage 4 bugfix in
 * src/app/api/growth-coach/lead/route.ts, where the send was gated on the
 * wrong consent flag entirely).
 *
 * Honest about what this actually enforces: TypeScript has no runtime
 * branding, so a caller COULD construct a `{ leadId, channel }` object
 * literal by hand instead of calling assertConsent() and pass that in
 * unchecked. What this pattern buys is that doing so is a visible,
 * deliberate act that stands out in code review — the pit of least
 * resistance is to call assertConsent() and get a real check, not to fake
 * the shape. It is not a cryptographic guarantee; it is a structural
 * nudge that makes the correct path the easy path.
 */

/**
 * There is deliberately no "text"/SMS channel here — a text-message
 * consent checkbox existed briefly (Stage 4) and was removed since there
 * is no texting feature (manual or automated) built or planned; adding it
 * back to this union without a corresponding real send path would be
 * dead code. Re-add it, with wording matched to how texting is actually
 * implemented, if/when that changes — see
 * supabase/migrations/0006_remove_text_message_consent.sql.
 */
export type ConsentChannel = "report" | "emailFollowUp" | "phone" | "marketing";

export class ConsentNotGrantedError extends Error {
  constructor(
    public readonly leadId: string,
    public readonly channel: ConsentChannel
  ) {
    super(`Lead ${leadId} has not consented to the "${channel}" channel — refusing to contact them this way.`);
    this.name = "ConsentNotGrantedError";
  }
}

/** Proof that assertConsent() actually checked this lead+channel. The only intended way to obtain one. */
export type ConsentProof = {
  readonly leadId: string;
  readonly channel: ConsentChannel;
};

function hasConsent(lead: LeadProfile, channel: ConsentChannel): boolean {
  switch (channel) {
    case "report":
      return lead.consentToSaveReport;
    case "emailFollowUp":
      return lead.consentToEmailFollowUp ?? false;
    case "phone":
      return lead.consentToPhoneCall ?? false;
    case "marketing":
      return lead.consentToMarketing;
  }
}

/**
 * Throws ConsentNotGrantedError unless the lead has actually consented to
 * this channel. Call this immediately before any send/call/text — not
 * earlier, not "somewhere upstream" — so the check and the action stay
 * next to each other in the code.
 */
export function assertConsent(lead: LeadProfile, channel: ConsentChannel): ConsentProof {
  if (!hasConsent(lead, channel)) throw new ConsentNotGrantedError(lead.id, channel);
  return { leadId: lead.id, channel };
}

/**
 * The one function that should send a transactional email to a LEAD
 * (never the owner's internal notification, never an account-lifecycle
 * email like a welcome/password-reset — neither of those is "contacting a
 * lead through a channel they opted into," so neither goes through this).
 * Requires a ConsentProof so the only way to call it correctly is to have
 * called assertConsent() first. Any future SMS or phone-outreach feature
 * should add its own equivalent (e.g. sendSmsToConsentedChannel) following
 * this same shape, not bypass this file's pattern.
 */
export async function sendToConsentedChannel(proof: ConsentProof, email: OutboundEmail): Promise<{ ok: true; previewId: string }> {
  void proof; // required so a caller can't construct this call without first obtaining one — see this file's top doc comment for what that does and doesn't guarantee.
  return getEmailAdapter().sendTransactional(email);
}
