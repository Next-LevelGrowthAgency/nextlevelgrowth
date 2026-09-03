"use client";

import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { comparisonRows, pricingPackages } from "@/lib/pricing-content";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, ChevronDown, Minus } from "lucide-react";
import { useState } from "react";

export function PackageComparison() {
  const [openId, setOpenId] = useState<string | null>("growth");

  return (
    <section className="bg-ink-50/60 py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-2 text-violet-600">Compare Packages</p>
          <h2 className="balance text-display-lg text-ink-900">See What&rsquo;s Included</h2>
        </div>

        {/* Desktop / tablet: a compact comparison table, fits within the page's max-width container with no horizontal scroll. */}
        <div className="mt-10 hidden overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft lg:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-1/4 bg-white p-4 text-sm font-semibold text-ink-500">
                  Feature
                </th>
                {pricingPackages.map((pkg) => (
                  <th key={pkg.id} scope="col" className="p-4 text-center">
                    <div className={cn("mx-auto flex w-full max-w-[9rem] flex-col items-center rounded-xl bg-gradient-to-br px-3 py-2.5 text-white", pkg.accent.gradient)}>
                      <span className="font-display text-sm font-semibold">{pkg.name}</span>
                      <span className="mt-0.5 text-xs opacity-90">${pkg.price}/mo</span>
                    </div>
                  </th>
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
                    <td key={pkg.id} className="p-3 text-center">
                      {row.included[pkg.id] ? (
                        <Check className={cn("mx-auto h-4 w-4", pkg.accent.text)} aria-label="Included" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-ink-300" aria-label="Not included" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one collapsible card per package — Growth open by default, no long scroll through every row for every plan. */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.08)}
          className="mt-10 flex flex-col gap-3 lg:hidden"
        >
          {pricingPackages.map((pkg) => {
            const isOpen = openId === pkg.id;
            return (
              <motion.div key={pkg.id} variants={fadeUp} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : pkg.id)}
                  className={cn("flex w-full items-center justify-between gap-3 bg-gradient-to-r px-5 py-3.5 text-left text-white", pkg.accent.gradient)}
                >
                  <div>
                    <p className="font-display text-base font-semibold">{pkg.name}</p>
                    <p className="text-xs opacity-90">${pkg.price}/month</p>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isOpen && "rotate-180")} aria-hidden="true" />
                </button>
                <div className={cn("grid overflow-hidden transition-all duration-300 ease-confident", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <ul className="divide-y divide-ink-100">
                      {comparisonRows.map((row) => (
                        <li key={row.label} className="flex items-center justify-between gap-3 px-5 py-2.5">
                          <span className="text-sm text-ink-700">{row.label}</span>
                          {row.included[pkg.id] ? (
                            <Check className={cn("h-4 w-4 shrink-0", pkg.accent.text)} aria-label="Included" />
                          ) : (
                            <Minus className="h-4 w-4 shrink-0 text-ink-300" aria-label="Not included" />
                          )}
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
