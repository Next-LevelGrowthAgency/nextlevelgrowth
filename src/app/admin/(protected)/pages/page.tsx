import { getSiteAnalyticsSnapshot } from "@/lib/site-analytics";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pages — Admin", robots: { index: false, follow: false } };

const PAGES: { key: keyof ReturnType<typeof getSiteAnalyticsSnapshot>["pageViews"]; label: string; href: string; note?: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "pricing", label: "Pricing", href: "/pricing", note: "package clicks below" },
  { key: "approach", label: "Our Approach", href: "/approach" },
  { key: "work", label: "Work", href: "/work" },
  { key: "about", label: "About", href: "/about" },
  { key: "contact", label: "Contact", href: "/contact", note: "form activity on Overview" },
];

const PACKAGE_LABELS: Record<string, string> = { foundation: "Foundation", launch: "Launch", growth: "Growth", "next-level": "Next Level" };

export default function AdminPagesPage() {
  const site = getSiteAnalyticsSnapshot();

  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">Pages</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-600">
        Views tracked directly by each page (best-effort, resets on redeploy — see{" "}
        <Link href="/admin/traffic" className="underline hover:text-ink-900">
          Traffic
        </Link>{" "}
        for the full picture). CTA click-through and contact-conversion tracking exist for the pages
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
              <tr key={page.key} className="border-b border-ink-50 last:border-0 hover:bg-paper-100">
                <td className="px-5 py-3 font-medium text-ink-900">{page.label}</td>
                <td className="px-5 py-3 text-ink-700">{site.pageViews[page.key]}</td>
                <td className="px-5 py-3 text-ink-500">{page.note ?? "—"}</td>
                <td className="px-5 py-3">
                  <Link href={page.href} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800">
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
        {Object.entries(site.packageClicksBySlug).map(([slug, count]) => (
          <div key={slug} className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-ink-500">{PACKAGE_LABELS[slug] ?? slug}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
