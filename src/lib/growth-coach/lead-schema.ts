import { z } from "zod";

/**
 * Shared between GrowthCoachLeadForm.tsx and the /api/growth-coach/lead
 * route, same pattern as growth-audit-schema.ts, so validation rules can
 * never drift out of sync between client and server.
 *
 * `report` and `context` are structural pass-through in this phase — the
 * server doesn't yet independently regenerate the report from stored
 * conversation state (see business-report.ts), so their contents are
 * trusted from the client rather than deeply re-validated. Revisit this
 * once conversations are persisted server-side.
 */
export const leadSubmissionSchema = z.object({
  sessionId: z.string().min(1).max(120),
  firstName: z.string().trim().min(1, "First name is required").max(80),
  email: z.string().trim().email("Enter a valid email address").max(200),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  cityState: z.string().trim().max(160).optional().or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\/.+\..+/i.test(value), { message: "Enter a valid website URL (starting with http:// or https://)" }),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  preferredContactMethod: z.enum(["Email", "Phone", "Text"]).optional(),
  consentToSaveReport: z.literal(true, { errorMap: () => ({ message: "Consent to save and send the report is required to continue." }) }),
  // Three separate, individually optional contact permissions — never a
  // single combined "may we contact you" checkbox. Each defaults to
  // unchecked and the visitor may accept the report while declining all
  // three.
  consentToEmailFollowUp: z.boolean(),
  consentToPhoneCall: z.boolean(),
  consentToTextMessage: z.boolean(),
  consentToMarketing: z.boolean(),
  consultationRequested: z.boolean().optional(),
  // Honeypot — must stay empty. Real visitors never see or fill this field.
  // Intentionally not constrained to length 0 here so a filled value still
  // reaches the route handler, which rejects it with a real error message
  // instead of a blank one from schema validation.
  companyWebsite2: z.string().max(300).optional().or(z.literal("")),
  report: z.record(z.any()),
  context: z.record(z.any()),
})
  .refine((data) => !(data.consentToPhoneCall || data.consentToTextMessage) || !!data.phone?.trim(), {
    message: "A phone number is required to consent to a phone call or text message.",
    path: ["phone"],
  });

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;
