import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200 bg-white p-7 shadow-soft transition-shadow duration-300 hover:shadow-lifted",
        className
      )}
      {...props}
    />
  );
}
