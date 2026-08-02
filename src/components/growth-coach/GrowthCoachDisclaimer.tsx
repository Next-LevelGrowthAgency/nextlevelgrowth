import { disclaimerText, previewNotice } from "@/lib/growth-coach/config";

export function GrowthCoachDisclaimer() {
  return (
    <div className="border-t border-ink-100 bg-paper-100 px-4 py-2.5">
      <p className="text-[11px] leading-relaxed text-ink-500">{disclaimerText}</p>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-ink-500">{previewNotice}</p>
    </div>
  );
}
