import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "ink" | "grove" | "signal" | "ember";

const toneStyles: Record<Tone, string> = {
  ink: "bg-ink-900 text-paper-100",
  grove: "bg-grove-100 text-grove-800",
  signal: "bg-signal-100 text-signal-800",
  ember: "bg-ember-300/40 text-ember-600",
};

export function Badge({
  tone = "grove",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
