import { Container } from "@/components/ui/Container";
import { Info } from "lucide-react";

export function PricingExplanation() {
  return (
    <section className="bg-paper-100 pb-14 sm:pb-20">
      <Container className="max-w-3xl">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-blue-600 to-purple-600 text-white">
            <Info className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">Every Business Is Different</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              Starting prices reflect a typical entry-level scope. Final pricing may vary based on project size,
              complexity, integrations, content requirements, functionality, and ongoing support needs. Before work
              begins, we&rsquo;ll define the project scope, deliverables, timeline, and final investment.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
