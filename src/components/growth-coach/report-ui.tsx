/**
 * Shared building blocks for the full-viewport report-style overlays
 * (GrowthCoachReportView, GrowthScoreResultsView) — extracted so both
 * documents render identically instead of maintaining two copies.
 */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-100 py-6 first:border-t-0 first:pt-0 print:break-inside-avoid">
      <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-500">Nothing to show here yet.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2">
          <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-grove-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export const PRIORITY_LABEL: Record<string, string> = {
  "do-now": "Do Now",
  "do-next": "Do Next",
  "do-later": "Do Later",
  "not-yet": "Not Yet",
};

export const PRIORITY_BADGE_TONE: Record<string, "grove" | "signal" | "ink" | "ember"> = {
  "do-now": "grove",
  "do-next": "signal",
  "do-later": "ink",
  "not-yet": "ember",
};
