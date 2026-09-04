import { getSiteAnalyticsSnapshot } from "@/lib/site-analytics";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pages — Admin", robots: { index: false, follow: false } };

const PAGES: { path: string; label: string; note?: string }[] = [
  { path: "/", label: "Home" },
  { path: "/pricing", label: "Pricing", note: "package clicks below" },
  { path: "/approach", label: "Our Approach" },
  { path: "/work", label: "Work" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact", note: "form activity on Overview" },
];

export default async function AdminPagesPage() {
  const site = await getSiteAnalyticsSnapshot(30);

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Pages</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Views tracked directly by each page over the last 30 days (see{" "}
        <Link href="/admin/traffic" className="underline hover:text-ink-900">
          Traffic
        </Link>{" "}
        to change the window). CTA click-through and contact-conversion tracking exist for the pages
        below where they apply.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Page</th>
              <th className="px-5 py-3">Views</th>
              <th className="px-5 py-3">Notes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {PAGES.map((page) => (
              <tr key={page.path} className="border-b border-ink-50 last:border-0 hover:bg-paper-100">
                <td className="px-5 py-3 font-medium text-ink-900">{page.label}</td>
                <td className="px-5 py-3 text-ink-700">{site.pageViewsByPath[page.path] ?? 0}</td>
                <td className="px-5 py-3 text-ink-500">{page.note ?? "—"}</td>
                <td className="px-5 py-3">
                  <Link href={page.path} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
                    View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-ink-500">Pricing Package Clicks</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(site.packageClicks).map(([label, count]) => (
          <div key={label} className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
