"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PricingPackage } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Rocket, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const icons: Record<string, LucideIcon> = { ShieldCheck, Rocket, TrendingUp, Crown };

type PackageSectionProps = {
  pkg: PricingPackage;
  imageSide?: "left" | "right";
  tone?: "paper" | "tint";
  children?: ReactNode;
};

/** Shared feature section used for each of the four monthly packages — kept scannable: name, price, one positioning line, features, CTA, image. */
export function PackageSection({ pkg, imageSide = "right", tone = "paper", children }: PackageSectionProps) {
  const PackageIcon = icons[pkg.icon] ?? ShieldCheck;
  const anchorId = pkg.id === "nextLevel" ? "next-level" : pkg.id;

  return (
    <section
      id={anchorId}
      className={cn("scroll-mt-24 py-14 sm:py-20", tone === "tint" ? pkg.accent.softBg : "bg-paper-100")}
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren(0.1)}
          className={cn(
            "grid grid-cols-1 items-center gap-10 lg:gap-14",
            imageSide === "right" ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"
          )}
        >
          <motion.div variants={fadeUp} className={cn(imageSide === "left" ? "lg:order-2" : "")}>
            {pkg.popular ? (
              <span className="mb-3 inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-soft">
                Most Popular
              </span>
            ) : null}

            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft", pkg.accent.gradient)}>
                <PackageIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-display-lg text-ink-900">{pkg.name}</h2>
            </div>

            <p className={cn("mt-3 balance font-display text-display-md", pkg.accent.text)}>{pkg.positioning[0]}</p>
            <p className="mt-2 text-sm font-medium text-ink-500">{pkg.bestFor}</p>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-1.5 border-t border-ink-100 pt-5">
              <p className="font-display text-3xl font-semibold text-ink-900">
                ${pkg.price}
                <span className="text-base font-normal text-ink-500">/month</span>
              </p>
              <p className="text-sm text-ink-500">Setup starting at ${pkg.setupPrice.toLocaleString()}</p>
            </div>

            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", pkg.accent.text)} aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-ink-700">{feature}</span>
                </li>
              ))}
            </ul>

            {pkg.scopeNote ? (
              <p className="mt-5 max-w-xl text-xs leading-relaxed text-ink-500">{pkg.scopeNote}</p>
            ) : null}

            <div className="mt-7">
              <Button
                href={`/contact?package=${pkg.id === "nextLevel" ? "next-level" : pkg.id}`}
                size="lg"
                className={cn("bg-gradient-to-r text-white shadow-soft hover:opacity-95 hover:shadow-lifted", pkg.accent.gradient)}
              >
                {pkg.cta}
              </Button>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className={cn("relative", imageSide === "left" ? "lg:order-1" : "")}>
            <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lifted">
              <Image
                src={pkg.image}
                alt={pkg.imageAlt}
                width={1672}
                height={941}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-auto w-full"
              />
            </div>
            <div
              aria-hidden="true"
              className={cn("absolute -bottom-4 -z-10 h-full w-full rounded-3xl bg-gradient-to-br opacity-40 blur-sm", pkg.accent.gradient, imageSide === "left" ? "-left-4" : "-right-4")}
            />
          </motion.div>
        </motion.div>

        {children}
      </Container>
    </section>
  );
}
