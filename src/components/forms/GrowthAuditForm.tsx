"use client";

import { Button } from "@/components/ui/Button";
import { TurnstileWidget } from "@/components/forms/TurnstileWidget";
import { collectAttribution } from "@/lib/attribution";
import { cn } from "@/lib/utils";
import {
  growthAuditSchema,
  industryOptions,
  primaryGoalOptions,
  servicesOfInterestOptions,
  type GrowthAuditFormValues,
} from "@/lib/growth-audit-schema";
import type { SubmissionResponse } from "@/lib/api/submission-response";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";

const initialValues: GrowthAuditFormValues = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  websiteUrl: "",
  industry: "",
  location: "",
  primaryGoal: "",
  biggestChallenge: "",
  servicesOfInterest: [],
  preferredContact: "Email",
  additionalDetails: "",
  hpToken: "",
};

const stepFieldGroups: (keyof GrowthAuditFormValues)[][] = [
  ["name", "businessName", "email", "phone"],
  ["websiteUrl", "industry", "location"],
  ["primaryGoal", "biggestChallenge", "servicesOfInterest"],
  ["preferredContact", "additionalDetails"],
];

const stepLabels = ["About You", "Your Business", "Your Goals", "Final Details"];

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function GrowthAuditForm() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<GrowthAuditFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof GrowthAuditFormValues, string>>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  const totalSteps = stepFieldGroups.length;
  const isLastStep = step === totalSteps - 1;

  function updateField<K extends keyof GrowthAuditFormValues>(field: K, value: GrowthAuditFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function toggleService(service: string) {
    setValues((prev) => {
      const has = prev.servicesOfInterest.includes(service);
      return {
        ...prev,
        servicesOfInterest: has
          ? prev.servicesOfInterest.filter((s) => s !== service)
          : [...prev.servicesOfInterest, service],
      };
    });
  }

  function validateCurrentStep(): boolean {
    const fieldsForStep = new Set(stepFieldGroups[step]);
    const result = growthAuditSchema.safeParse(values);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Partial<Record<keyof GrowthAuditFormValues, string>> = {};
    let stepHasError = false;
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof GrowthAuditFormValues;
      if (fieldsForStep.has(key)) {
        nextErrors[key] = issue.message;
        stepHasError = true;
      }
    }
    setErrors(nextErrors);
    return !stepHasError;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, totalSteps - 1));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    if (submittingRef.current) return; // prevents double-click double submission
    if (values.hpToken) return; // honeypot — silently drop, no error shown to a bot

    const fullResult = growthAuditSchema.safeParse(values);
    if (!fullResult.success) {
      setStep(0);
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/growth-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fullResult.data, turnstileToken: turnstileTokenRef.current, ...collectAttribution() }),
      });
      const result = (await res.json().catch(() => null)) as SubmissionResponse | null;

      if (!result || !result.ok) {
        if (result?.code === "VALIDATION_ERROR" && result.fieldErrors) {
          const nextErrors: Partial<Record<keyof GrowthAuditFormValues, string>> = {};
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) nextErrors[key as keyof GrowthAuditFormValues] = messages[0];
          }
          setErrors(nextErrors);
          // Jump back to the earliest step containing an invalid field so
          // the visitor actually sees what needs fixing, instead of a
          // generic error on the final "submit" screen.
          const invalidStepIndex = stepFieldGroups.findIndex((fields) => fields.some((f) => nextErrors[f]));
          if (invalidStepIndex >= 0) setStep(invalidStepIndex);
        }
        setServerError(result?.message ?? "Something went wrong submitting your audit request. Please try again, or email us directly.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setSubmissionId(result.submissionId);
    } catch {
      setStatus("error");
      setServerError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-grove-200 bg-grove-50 p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-grove-600" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-ink-900">
          Your Growth Audit request is in.
        </h3>
        <p className="mt-2 text-ink-600">
          We&rsquo;ll review what you&rsquo;ve shared and follow up using your
          preferred contact method within one business day.
        </p>
        {submissionId ? <p className="mt-3 text-xs text-ink-500">Reference: {submissionId}</p> : null}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft sm:p-10">
      <ProgressIndicator step={step} totalSteps={totalSteps} labels={stepLabels} />

      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          isLastStep ? handleSubmit() : handleNext();
        }}
        noValidate
      >
        {step === 0 ? (
          <fieldset className="space-y-5">
            <legend className="sr-only">About you</legend>
            <TextField
              id="name"
              label="Name"
              value={values.name}
              onChange={(v) => updateField("name", v)}
              error={errors.name}
              autoComplete="name"
            />
            <TextField
              id="businessName"
              label="Business name"
              value={values.businessName}
              onChange={(v) => updateField("businessName", v)}
              error={errors.businessName}
              autoComplete="organization"
            />
            <TextField
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(v) => updateField("email", v)}
              error={errors.email}
              autoComplete="email"
            />
            <TextField
              id="phone"
              label="Phone number"
              type="tel"
              value={values.phone ?? ""}
              onChange={(v) => updateField("phone", v)}
              error={errors.phone}
              autoComplete="tel"
              required={false}
              hint="Required only if you choose Phone or Text as your preferred contact method on the last step."
            />
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset className="space-y-5">
            <legend className="sr-only">Your business</legend>
            <TextField
              id="websiteUrl"
              label="Current website URL (if you have one)"
              value={values.websiteUrl ?? ""}
              onChange={(v) => updateField("websiteUrl", v)}
              error={errors.websiteUrl}
              required={false}
            />
            <SelectField
              id="industry"
              label="Industry"
              value={values.industry}
              onChange={(v) => updateField("industry", v)}
              error={errors.industry}
              options={industryOptions}
            />
            <TextField
              id="location"
              label="City / service area"
              value={values.location}
              onChange={(v) => updateField("location", v)}
              error={errors.location}
            />
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="space-y-5">
            <legend className="sr-only">Your goals</legend>
            <SelectField
              id="primaryGoal"
              label="Primary goal"
              value={values.primaryGoal}
              onChange={(v) => updateField("primaryGoal", v)}
              error={errors.primaryGoal}
              options={primaryGoalOptions}
            />
            <TextAreaField
              id="biggestChallenge"
              label="Biggest current challenge"
              value={values.biggestChallenge}
              onChange={(v) => updateField("biggestChallenge", v)}
              error={errors.biggestChallenge}
            />
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-800">Services of interest</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {servicesOfInterestOptions.map((service) => (
                  <label
                    key={service}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-200 px-3 py-2.5 text-sm text-ink-800 has-[:checked]:border-grove-500 has-[:checked]:bg-grove-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-300 text-grove-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-grove-600"
                      checked={values.servicesOfInterest.includes(service)}
                      onChange={() => toggleService(service)}
                    />
                    {service}
                  </label>
                ))}
              </div>
              {errors.servicesOfInterest ? (
                <p role="alert" className="mt-2 text-sm font-medium text-red-700">
                  {errors.servicesOfInterest}
                </p>
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {step === 3 ? (
          <fieldset className="space-y-5">
            <legend className="sr-only">Final details</legend>
            <div>
              <span className="mb-2 block text-sm font-medium text-ink-800">Preferred contact method</span>
              <div className="flex gap-3">
                {(["Email", "Phone", "Text"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm has-[:checked]:border-grove-500 has-[:checked]:bg-grove-50"
                  >
                    <input
                      type="radio"
                      name="preferredContact"
                      className="h-4 w-4 text-grove-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-grove-600"
                      checked={values.preferredContact === method}
                      onChange={() => updateField("preferredContact", method)}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <TextAreaField
              id="additionalDetails"
              label="Anything else we should know?"
              value={values.additionalDetails ?? ""}
              onChange={(v) => updateField("additionalDetails", v)}
              required={false}
            />
            {/* Honeypot — display:none (not sr-only) so autofill never reaches it; see ContactForm.tsx for the full rationale. */}
            <input
              type="text"
              name="hpToken"
              value={values.hpToken ?? ""}
              onChange={(e) => updateField("hpToken", e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <TurnstileWidget onToken={(token) => (turnstileTokenRef.current = token)} />
          </fieldset>
        ) : null}

        {serverError ? (
          <p role="alert" className="mt-4 text-sm font-medium text-red-700">
            {serverError}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={status === "submitting"}>
            {isLastStep ? (status === "submitting" ? "Submitting…" : "Submit My Audit Request") : "Continue"}
          </Button>
        </div>
      </form>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-500">
        <ShieldCheck className="h-4 w-4 shrink-0 text-grove-600" aria-hidden="true" />
        Your information is only used to prepare your Growth Audit and is never sold.
      </p>
    </div>
  );
}

function ProgressIndicator({
  step,
  totalSteps,
  labels,
}: {
  step: number;
  totalSteps: number;
  labels: string[];
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-ink-500">
        {labels.map((label, index) => (
          <span key={label} className={index <= step ? "text-grove-700" : undefined}>
            {label}
          </span>
        ))}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
        <div
          className="h-full rounded-full bg-grove-600 transition-all duration-300 ease-confident"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required = true,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  /** Short helper text below the field — for context that isn't a validation error (e.g. "required only if..."). */
  hint?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label} {required ? null : <span className="font-normal text-ink-500">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn(
          "w-full rounded-lg border px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600",
          error ? "border-red-400" : "border-ink-200"
        )}
      />
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  required = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label} {required ? null : <span className="font-normal text-ink-500">(optional)</span>}
      </label>
      <textarea
        id={id}
        value={value}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-lg border px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600",
          error ? "border-red-400" : "border-ink-200"
        )}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  error,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  options: string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-lg border bg-white px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600",
          error ? "border-red-400" : "border-ink-200"
        )}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
