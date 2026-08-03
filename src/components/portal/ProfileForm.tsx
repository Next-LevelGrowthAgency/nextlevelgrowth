"use client";

import { Button } from "@/components/ui/Button";
import { updateProfile, type ProfileUpdateResult } from "@/app/portal/profile/actions";
import { useActionState } from "react";

export function ProfileForm({ initialValues }: { initialValues: { email: string; fullName: string; businessName: string; phone: string } }) {
  const [state, formAction, pending] = useActionState<ProfileUpdateResult | null, FormData>(async (_prev, formData) => updateProfile(formData), null);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
          Email
        </label>
        <input
          id="email"
          value={initialValues.email}
          disabled
          className="w-full rounded-lg border border-ink-200 bg-ink-50 px-4 py-2.5 text-ink-500"
        />
        <p className="mt-1 text-xs text-ink-500">Contact us to change the email on your account.</p>
      </div>

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink-800">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={initialValues.fullName}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>

      <div>
        <label htmlFor="businessName" className="mb-1.5 block text-sm font-medium text-ink-800">
          Business name <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="businessName"
          name="businessName"
          defaultValue={initialValues.businessName}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-800">
          Phone <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialValues.phone}
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}
      {state && state.ok ? (
        <p role="status" className="text-sm font-medium text-grove-700">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
