import { z } from "zod";
import { attributionSchemaFields } from "@/lib/attribution";
import { emailField, honeypotField, nameField, optionalPhoneField, optionalTrimmedString, optionalUrlField, turnstileTokenField } from "@/lib/validation/fields";

/**
 * Shared between GrowthCoachLeadForm.tsx and the /api/growth-coach/lead
 * route, same pattern as growth-audit-schema.ts and contact-schema.ts —
 * all three now build on the same field validators in
 * src/lib/validation/fields.ts, so a fix to email/phone/name handling
 * (like the trim-before-validating fix) can never apply to only one form.
 *
 * `report` and `context` are structural pass-through in this phase — the
 * server doesn't yet independently regenerate the report from stored
 * conversation state (see business-report.ts), so their contents are
 * trusted from the client rather than deeply re-validated. Revisit this
 * once conversations are persisted server-side.
 */
export const leadSubmissionSchema = z
  .object({
    sessionId: z.string().min(1).max(120),
    firstName: nameField("first name", { max: 80 }),
    email: emailField,
    businessName: optionalTrimmedString(160),
    cityState: optionalTrimmedString(160),
    websiteUrl: optionalUrlField,
    phone: optionalPhoneField,
    preferredContactMethod: z.enum(["Email", "Phone", "Text"]).optional(),
    consentToSaveReport: z.literal(true, { errorMap: () => ({ message: "Consent to save and send the report is required to continue." }) }),
    // Two separate, individually optional contact permissions — never a
    // single combined "may we contact you" checkbox. Each defaults to
    // unchecked and the visitor may accept the report while declining
    // both. (There was briefly a third, consentToTextMessage — removed:
    // no texting feature, manual or automated, exists or is planned. See
    // supabase/migrations/0006_remove_text_message_consent.sql.)
    consentToEmailFollowUp: z.boolean(),
    consentToPhoneCall: z.boolean(),
    consentToMarketing: z.boolean(),
    consultationRequested: z.boolean().optional(),
    hpToken: honeypotField,
    turnstileToken: turnstileTokenField,
    report: z.record(z.any()),
    context: z.record(z.any()),
    // Full transcript — preserved server-side for the admin dashboard and
    // never re-sent to the visitor. Capped generously; a real conversation
    // realistically stays well under this.
    messages: z
      .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(5000) }))
      .max(200)
      .optional(),
    businessPath: z.enum(["start", "grow"]).nullable().optional(),
    responseDepth: z.enum(["quick", "deep", "guide-me"]).nullable().optional(),
    ...attributionSchemaFields,
  })
  .refine((data) => !data.consentToPhoneCall || !!data.phone, {
    message: "A phone number is required to consent to a phone call.",
    path: ["phone"],
  });

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;
