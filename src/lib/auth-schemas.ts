import { z } from "zod";
import { emailField, nameField, optionalPhoneField, optionalTrimmedString } from "@/lib/validation/fields";

/**
 * Password rules deliberately kept to what NIST/OWASP actually recommend
 * (length over complexity theater): a reasonable minimum, a generous
 * maximum (bcrypt/Supabase truncates far beyond this anyway), no forced
 * mix of character classes that pushes people toward "Password1!" and a
 * sticky note.
 */
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200, "That password is too long.");

export const signupSchema = z
  .object({
    fullName: nameField("full name", { max: 120 }),
    email: emailField,
    businessName: optionalTrimmedString(200),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match.", path: ["confirmPassword"] });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Please enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match.", path: ["confirmPassword"] });

export const profileUpdateSchema = z.object({
  fullName: nameField("full name", { max: 120 }),
  businessName: optionalTrimmedString(200),
  phone: optionalPhoneField,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
