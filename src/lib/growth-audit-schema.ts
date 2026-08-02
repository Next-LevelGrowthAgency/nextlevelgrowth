import { z } from "zod";

/**
 * Shared validation schema for the Growth Audit form — used on both the
 * client (per-step validation) and the server (/api/growth-audit), so the
 * rules can never drift out of sync.
 */
export const growthAuditSchema = z.object({
  name: z.string().min(1, "Please enter your name."),
  businessName: z.string().min(1, "Please enter your business name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(7, "Please enter a valid phone number."),
  websiteUrl: z.string().optional().or(z.literal("")),
  industry: z.string().min(1, "Please select your industry."),
  location: z.string().min(1, "Please enter your city or service area."),
  primaryGoal: z.string().min(1, "Please select your primary goal."),
  biggestChallenge: z.string().min(1, "Tell us a bit about your biggest challenge."),
  servicesOfInterest: z.array(z.string()).min(1, "Select at least one service."),
  preferredContact: z.enum(["Email", "Phone", "Text"]),
  additionalDetails: z.string().optional().or(z.literal("")),
});

export type GrowthAuditFormValues = z.infer<typeof growthAuditSchema>;

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
