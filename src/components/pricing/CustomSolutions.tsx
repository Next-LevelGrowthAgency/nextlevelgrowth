"use client";

import { Container } from "@/components/ui/Container";
import { customServiceCategories, socialContentScopeNote } from "@/lib/pricing-content";
import { cn } from "@/lib/utils";
import { AppWindow, Brain, ChevronDown, LayoutTemplate, TrendingUp, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const categoryIcons: Record<string, LucideIcon> = { LayoutTemplate, AppWindow, Brain, TrendingUp };

const categoryAccents: Record<string, string> = {
  web: "from-teal-500 to-cyan-500",
  apps: "from-violet-500 to-purple-600",
  "ai-automation": "from-blue-600 to-violet-600",
  growth: "from-indigo-700 to-purple-900",
};

export function CustomSolutions() {
  const [openId, setOpenId] = useState<string | null>("web");

  return (
    <section className="bg-paper-100 py-14 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
          <div>
            <p className="text-eyebrow mb-2 text-teal-600">Individual Services</p>
            <h2 className="balance text-display-lg text-ink-900">Custom Digital Solutions</h2>
            <p className="mt-3 max-w-lg text-body text-ink-600">
              Need one specific solution? Choose the service your business needs and build from there.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-ink-100 shadow-soft">
            <Image
              src="/images/Pricing/Pricing-Breakdown.jpeg"
              alt="Full price breakdown of Next Level Growth Agency's monthly packages and individual services"
              width={1536}
              height={864}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="mt-10 divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
          {customServiceCategories.map((category) => {
            const CategoryIcon = categoryIcons[category.icon] ?? LayoutTemplate;
            const isOpen = openId === category.id;
            return (
              <div key={category.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : category.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white", categoryAccents[category.id])}>
                      <CategoryIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-display text-base font-semibold text-ink-900">{category.label}</span>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-ink-400 transition-transform duration-300", isOpen && "rotate-180")} aria-hidden="true" />
                </button>

                <div className={cn("grid overflow-hidden transition-all duration-300 ease-confident", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.services.map((service) => (
                        <div key={service.name} className="flex flex-col rounded-xl border border-ink-100 bg-paper-100 p-5">
                          <h3 className="font-display text-sm font-semibold text-ink-900">{service.name}</h3>
                          <p className="mt-2 font-display text-xl font-semibold text-ink-900">{service.startingPrice}</p>
                          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                            Optional Monthly Service: {service.optionalMonthly}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-ink-600">{service.description}</p>
                        </div>
                      ))}
                    </div>
                    {category.id === "growth" ? (
                      <p className="px-6 pb-6 text-xs leading-relaxed text-ink-500">{socialContentScopeNote}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
