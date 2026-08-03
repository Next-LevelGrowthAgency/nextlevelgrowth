/**
 * Standard shape every form/lead submission API route returns. The front
 * end should switch on `code` (failure) — never infer the problem from the
 * HTTP status alone — so a database/email/configuration failure is never
 * misreported to the visitor as "you entered something wrong."
 */
export type SubmissionErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SPAM_REJECTED"
  | "DATABASE_ERROR"
  | "EMAIL_ERROR"
  | "CONFIGURATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DUPLICATE_SUBMISSION"
  | "INTERNAL_ERROR";

export type SubmissionResponse =
  | {
      ok: true;
      submissionId: string;
      message: string;
      emailStatus?: "sent" | "skipped" | "failed";
    }
  | {
      ok: false;
      code: SubmissionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
      submissionId?: string;
    };

export function generateSubmissionId(prefix: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${random}`;
}
