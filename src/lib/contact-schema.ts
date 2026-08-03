import { z } from "zod";
import { attributionSchemaFields } from "@/lib/attribution";
import { emailField, honeypotField, messageField, nameField, optionalPhoneField, optionalTrimmedString, turnstileTokenField } from "@/lib/validation/fields";

/**
 * Shared between ContactForm.tsx and /api/contact — same pattern as
 * growth-audit-schema.ts and lead-schema.ts, so validation can never drift
 * out of sync between client and server. All three now share the same
 * underlying field validators (src/lib/validation/fields.ts) instead of
 * each hand-rolling its own `z.string().email()`.
 */
export const contactSchema = z.object({
  name: nameField("name"),
  email: emailField,
  message: messageField({ min: 1, max: 5000 }),
  phone: optionalPhoneField,
  companyName: optionalTrimmedString(200),
  hpToken: honeypotField,
  turnstileToken: turnstileTokenField,
  ...attributionSchemaFields,
});

export type ContactFormValues = z.infer<typeof contactSchema>;
