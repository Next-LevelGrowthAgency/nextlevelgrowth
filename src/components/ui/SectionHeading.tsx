import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

/** Consistent eyebrow + headline + supporting copy pattern used across every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-grove-300" : "text-grove-700"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "balance text-display-lg",
          tone === "dark" ? "text-paper-100" : "text-ink-900"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed",
            tone === "dark" ? "text-paper-300" : "text-ink-600"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
