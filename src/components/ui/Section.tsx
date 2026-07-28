import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: "paper" | "ink" | "transparent";
};

const toneStyles: Record<NonNullable<SectionProps["tone"]>, string> = {
  paper: "bg-paper-100",
  ink: "bg-ink-900 text-paper-100",
  transparent: "",
};

/** Consistent vertical rhythm + background tone wrapper for page sections. */
export function Section({ tone = "transparent", className, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-20 sm:py-28", toneStyles[tone], className)} {...props}>
      {children}
    </section>
  );
}
