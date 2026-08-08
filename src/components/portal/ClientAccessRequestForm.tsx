"use client";

import { Button } from "@/components/ui/Button";
import { requestClientAccess, type ClientAccessRequestResult } from "@/app/portal/actions";
import { useActionState } from "react";

export function ClientAccessRequestForm() {
  const [state, formAction, pending] = useActionState<ClientAccessRequestResult | null, FormData>(
    async (_prev, formData) => requestClientAccess(formData),
    null
  );

  if (state?.ok) {
    return <p className="text-sm font-medium text-grove-700">Request submitted — you&rsquo;ll see the status here once it&rsquo;s reviewed.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-ink-800">
          Anything you&rsquo;d like us to know? <span className="font-normal text-ink-500">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={500}
          placeholder="e.g. what you're working with us on, or how you found us"
          className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grove-600"
        />
      </div>
      {state && !state.ok ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Request client access"}
      </Button>
    </form>
  );
}
