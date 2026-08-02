import { Badge } from "@/components/ui/Badge";
import type { StructuredReport } from "@/types";

function ReportBody({ body }: { body: string | string[] }) {
  if (Array.isArray(body)) {
    return (
      <ul className="mt-1 space-y-1.5">
        {body.map((item, index) => (
          <li key={index} className="flex gap-2 text-sm leading-relaxed text-ink-700">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-grove-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-1 text-sm leading-relaxed text-ink-700">{body}</p>;
}

export function GrowthCoachReport({ report }: { report: StructuredReport }) {
  return (
    <div className="mt-2 max-w-[92%] rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:max-w-[480px]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-sm font-semibold text-ink-900">{report.title}</p>
        {report.demo ? <Badge tone="ember">Demo</Badge> : null}
      </div>
      {report.scoreLabel ? <p className="mt-1 text-xs font-medium text-ink-500">{report.scoreLabel}</p> : null}
      <div className="mt-3 space-y-3 divide-y divide-ink-100">
        {report.sections.map((section) => (
          <div key={section.heading} className="pt-3 first:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-grove-700">{section.heading}</p>
            <ReportBody body={section.body} />
          </div>
        ))}
      </div>
    </div>
  );
}
