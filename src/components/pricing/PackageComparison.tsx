"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { comparisonRows, pricingPackages } from "@/lib/pricing-content";
import { cn } from "@/lib/utils";
import type { PricingPackageId } from "@/types";
import { motion } from "framer-motion";
import { Check, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";

/** Presentational only, not part of the pricing content model: a one-word summary of what each tier is for, shown as a quick visual scan above the full comparison. */
const stepLabel: Record<PricingPackageId, string> = {
  foundation: "Maintain",
  launch: "Build",
  growth: "Grow",
  nextLevel: "Scale",
};

function ComparisonCell({ value, emphasize }: { value: boolean | string; emphasize?: boolean }) {
  if (typeof value === "string") {
    return (
      <span className={cn("text-xs font-medium leading-snug sm:text-sm", emphasize ? "text-blue-700" : "text-ink-600")}>
        {value}
      </span>
    );
  }
  return value ? (
    <Check className={cn("mx-auto h-4 w-4", emphasize ? "text-blue-600" : "text-ink-400")} aria-label="Included" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-ink-300" aria-label="Not included" />
  );
}

export function PackageComparison() {
  const [openId, setOpenId] = useState<string | null>("growth");

  return (
    <section className="bg-ink-50/60 py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-2 text-violet-600">Compare Packages</p>
          <h2 className="balance text-display-lg text-ink-900">Compare Your Options</h2>
          <p className="mt-4 text-subhead text-ink-600">
            Each package builds on the one before it. Choose the level that fits where your business
            is today, and where you want to go next.
          </p>
        </div>

        {/* Quick four-word scan of what each tier is for, before the detailed table below. */}
        <ol className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-2 sm:gap-3">
          {pricingPackages.map((pkg) => (
            <li
              key={pkg.id}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center",
                pkg.popular ? "border-blue-200 bg-blue-50" : "border-ink-100 bg-white"
              )}
            >
              <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full bg-gradient-to-br", pkg.accent.gradient)} />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 sm:text-[11px]">
                {pkg.name}
              </span>
              <span className="font-display text-sm font-semibold text-ink-900">{stepLabel[pkg.id]}</span>
            </li>
          ))}
        </ol>

        {/* Desktop / tablet: a compact comparison table, fits within the page's max-width container with no horizontal scroll. */}
        <div className="mt-8 hidden overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-1/4 bg-white p-4 align-bottom text-sm font-semibold text-ink-500">
                  Feature
                </th>
                {pricingPackages.map((pkg) => (
                  <th key={pkg.id} scope="col" className="relative p-4 pt-6 text-center align-bottom">
                    {pkg.popular ? (
                      <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-soft">
                        Most Popular
                      </span>
                    ) : null}
                    <div
                      className={cn(
                        "mx-auto flex w-full max-w-[10rem] flex-col items-center rounded-xl bg-gradient-to-br px-3 py-3 text-white",
                        pkg.accent.gradient,
                        pkg.popular && "shadow-lifted ring-2 ring-blue-300 ring-offset-2 ring-offset-white"
                      )}
                    >
                      <span className="font-display text-sm font-semibold">{pkg.name}</span>
                      <span className="mt-0.5 text-xs opacity-90">${pkg.price}/mo</span>
                      <span className="mt-1.5 text-[11px] leading-snug opacity-90">{pkg.compareValueLabel}</span>
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-t border-ink-100 bg-paper-100/70">
                <th scope="row" className="p-3 pl-5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Best For
                </th>
                {pricingPackages.map((pkg) => (
                  <td
                    key={pkg.id}
                    className={cn("p-3 text-center text-xs leading-snug text-ink-500", pkg.popular && "bg-blue-50/70 font-medium text-blue-700")}
                  >
                    {pkg.bestForShort}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-paper-100"}>
                  <th scope="row" className="p-3 pl-5 text-sm font-medium text-ink-700">
                    {row.label}
                  </th>
                  {pricingPackages.map((pkg) => (
                    <td key={pkg.id} className={cn("p-3 text-center", pkg.popular && "bg-blue-50/50")}>
                      <ComparisonCell value={row.values[pkg.id]} emphasize={pkg.popular} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one collapsible card per package, Growth open by default, no long scroll through every row for every plan. */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.08)}
          className="mt-8 flex flex-col gap-3 lg:hidden"
        >
          {pricingPackages.map((pkg) => {
            const isOpen = openId === pkg.id;
            return (
              <motion.div
                key={pkg.id}
                variants={fadeUp}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-soft",
                  pkg.popular ? "border-blue-300 ring-1 ring-blue-200" : "border-ink-100"
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : pkg.id)}
                  className={cn("flex w-full items-center justify-between gap-3 bg-gradient-to-r px-5 py-3.5 text-left text-white", pkg.accent.gradient)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-semibold">{pkg.name}</p>
                      {pkg.popular ? (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                          Most Popular
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs opacity-90">${pkg.price}/month</p>
                    <p className="mt-0.5 text-xs opacity-80">{pkg.compareValueLabel}</p>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isOpen && "rotate-180")} aria-hidden="true" />
                </button>
                <div className={cn("grid overflow-hidden transition-all duration-300 ease-confident", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="border-b border-ink-100 bg-paper-100 px-5 py-2.5 text-xs text-ink-500">
                      <span className="font-semibold uppercase tracking-wide text-ink-400">Best for: </span>
                      {pkg.bestForShort}
                    </p>
                    <ul className="divide-y divide-ink-100">
                      {comparisonRows.map((row) => (
                        <li key={row.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
                          <span className="text-sm text-ink-700">{row.label}</span>
                          <span className="shrink-0 text-right">
                            <ComparisonCell value={row.values[pkg.id]} emphasize={pkg.popular} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
