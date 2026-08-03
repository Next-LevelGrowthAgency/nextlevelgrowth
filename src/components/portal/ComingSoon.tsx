import { Sparkles } from "lucide-react";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="font-display text-display-md text-ink-900">{title}</h1>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-white p-12 text-center">
        <Sparkles className="h-8 w-8 text-grove-600" aria-hidden="true" />
        <p className="font-medium text-ink-900">Coming soon</p>
        <p className="max-w-md text-sm text-ink-600">{description}</p>
      </div>
    </div>
  );
}
