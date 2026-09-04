"use client";

import { updateLeadStatus } from "@/app/admin/(protected)/leads/actions";
import type { LeadProfile } from "@/types";
import { useTransition } from "react";

type Status = NonNullable<LeadProfile["followUpStatus"]>;

/**
 * Inline status change directly from the Inquiries list — calls the
 * existing, independently-authorized updateLeadStatus Server Action
 * (src/app/admin/(protected)/leads/actions.ts). A client component only
 * because an onChange handler requires one; the actual authorization
 * check happens server-side inside the action itself.
 */
export function LeadStatusSelect({ leadId, status, options }: { leadId: string; status: Status; options: Status[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(event) => {
        const next = event.target.value as Status;
        startTransition(() => {
          updateLeadStatus(leadId, next);
        });
      }}
      className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs text-ink-800 disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
