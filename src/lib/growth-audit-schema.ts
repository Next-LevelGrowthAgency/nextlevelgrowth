import { z } from "zod";
import { attributionSchemaFields } from "@/lib/attribution";
import { emailField, honeypotField, messageField, nameField, optionalPhoneField, optionalTrimmedString, optionalUrlField, phoneField, turnstileTokenField } from "@/lib/validation/fields";

/**
 * Shared validation schema for the Growth Audit form — used on both the
 * client (per-step validation) and the server (/api/growth-audit), so the
 * rules can never drift out of sync.
 *
 * Phone is conditionally required (see the `.superRefine` below), matching
 * the selected preferred contact method rather than being unconditionally
 * required regardless of what the visitor actually chooses — previously
 * `phone` was always required on Step 0 even for visitors who picked
 * "Email" as their preferred contact method three steps later.
 */
const baseGrowthAuditSchema = z.object({
  name: nameField("name"),
  // Business names legitimately contain digits, ampersands, apostrophes,
  // etc. ("Joe's Pizza & Grill #2") — deliberately NOT run through the
  // stricter person-name pattern used for `name` above.
  businessName: z.string().trim().min(1, "Please enter your business name.").max(200, "That business name is too long."),
  email: emailField,
  phone: optionalPhoneField,
  websiteUrl: optionalUrlField,
  industry: z.string().trim().min(1, "Please select your industry."),
  location: z.string().trim().min(1, "Please enter your city or service area.").max(200),
  primaryGoal: z.string().trim().min(1, "Please select your primary goal."),
  biggestChallenge: messageField({ min: 1, max: 2000 }),
  servicesOfInterest: z.array(z.string()).min(1, "Select at least one service."),
  preferredContact: z.enum(["Email", "Phone", "Text"]),
  additionalDetails: optionalTrimmedString(2000),
  // Honeypot — real visitors never see or fill this field.
  hpToken: honeypotField,
  turnstileToken: turnstileTokenField,
  ...attributionSchemaFields,
});

export const growthAuditSchema = baseGrowthAuditSchema.superRefine((data, ctx) => {
  if ((data.preferredContact === "Phone" || data.preferredContact === "Text") && !data.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message:
        data.preferredContact === "Phone"
          ? "A phone number is required when Phone is your preferred contact method."
          : "A mobile number is required when Text is your preferred contact method.",
    });
  } else if (data.phone) {
    const check = phoneField.safeParse(data.phone);
    if (!check.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: check.error.issues[0]?.message ?? "Please enter a valid phone number." });
    }
  }
});

export type GrowthAuditFormValues = z.infer<typeof baseGrowthAuditSchema>;

export const industryOptions = [
  "Restaurant / Café",
  "Retail",
  "Salon / Spa",
  "Gym / Fitness Studio",
  "Dental / Medical Practice",
  "Chiropractic",
  "Legal",
  "Accounting / Financial",
  "Real Estate / Property Management",
  "Auto Repair",
  "Cleaning Company",
  "Consulting / Coaching",
  "Home Services / Contracting",
  "Plumbing / Electrical / HVAC",
  "Roofing / Landscaping",
  "Other",
];

export const primaryGoalOptions = [
  "Get a new website",
  "Improve my existing website",
  "Get found more on Google",
  "Generate more leads",
  "Improve my online reputation",
  "Not sure yet, I need guidance",
];

export const servicesOfInterestOptions = [
  "Website Design",
  "Local SEO",
  "Digital Marketing",
  "Automation & AI Chat",
  "Ongoing Support & Maintenance",
  "Not sure yet",
];
