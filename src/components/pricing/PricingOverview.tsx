"use client";

import { Container } from "@/components/ui/Container";
import { pricingPackages } from "@/lib/pricing-content";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Crown, Rocket, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import Link from "next/link";

const icons: Record<string, LucideIcon> = { ShieldCheck, Rocket, TrendingUp, Crown };

export function PricingOverview() {
  return (
    <section id="packages" className="scroll-mt-24 bg-paper-100 py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow mb-2 text-blue-600">Monthly Packages</p>
          <h2 className="balance text-display-lg text-ink-900">Build. Support. Grow. Scale.</h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {pricingPackages.map((pkg) => {
            const Icon = icons[pkg.icon] ?? ShieldCheck;
            return (
              <motion.div
                key={pkg.id}
                variants={fadeUp}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted",
                  pkg.popular ? "border-blue-300 ring-1 ring-blue-200" : "border-ink-200"
                )}
              >
                {pkg.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-soft">
                    Most Popular
                  </span>
                ) : null}

                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white", pkg.accent.gradient)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>

                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{pkg.name}</h3>
                <p className="mt-1 text-sm text-ink-600">{pkg.tagline}</p>
                <p className="mt-2 text-xs font-medium text-ink-400">{pkg.bestFor.replace(/^Best for /, "For ")}</p>

                <div className="mt-4">
                  <p className="font-display text-2xl font-semibold text-ink-900">
                    ${pkg.price}
                    <span className="text-sm font-normal text-ink-500">/month</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">Setup starting at ${pkg.setupPrice.toLocaleString()}</p>
                </div>

                <Link
                  href={`#${pkg.id === "nextLevel" ? "next-level" : pkg.id}`}
                  className={cn("mt-5 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-paper-200", pkg.accent.border)}
                >
                  View Details
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
