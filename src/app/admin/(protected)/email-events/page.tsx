import { getLeadAdapter } from "@/lib/growth-coach/adapters";
import { isEmailDeliveryActive } from "@/lib/growth-coach/adapters";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Delivery — Admin", robots: { index: false, follow: false } };

export default async function AdminEmailEventsPage() {
  const events = await getLeadAdapter().listEmailEvents(200);
  const active = isEmailDeliveryActive();

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Email Delivery</h1>
      {!active ? (
        <div className="mt-3 rounded-xl border border-dashed border-ember-500 bg-ember-300/20 p-4 text-sm text-ink-800">
          Resend isn&rsquo;t configured yet (RESEND_API_KEY / EMAIL_FROM_ADDRESS) — no real emails are being sent, so this list will stay empty.
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Recipient</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink-500">
                  No email events recorded yet.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-5 py-3 text-ink-600">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3">{e.emailType}</td>
                  <td className="px-5 py-3">{e.recipient}</td>
                  <td className="px-5 py-3">
                    <span className={e.status === "sent" ? "font-medium text-grove-700" : "font-medium text-red-700"}>{e.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {e.leadId ? (
                      <Link href={`/admin/leads/${e.leadId}`} className="text-grove-700 hover:underline">
                        View
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[240px] truncate px-5 py-3 text-red-700" title={e.errorMessage}>
                    {e.errorMessage ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
