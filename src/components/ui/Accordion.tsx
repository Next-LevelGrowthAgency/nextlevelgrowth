"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export type AccordionItemData = {
  question: string;
  answer: string;
};

/**
 * Accessible, single-open accordion used for the FAQ sections.
 * Uses native button semantics + aria-expanded/aria-controls so it works
 * with keyboard and screen readers without extra ARIA plumbing.
 */
export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium text-ink-900">{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 shrink-0 text-ink-500 transition-transform duration-300 motion-reduce:transition-none",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid overflow-hidden transition-all duration-300 ease-confident motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 leading-relaxed text-ink-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
