"use client";

import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { conceptProjects } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import Image from "next/image";

const accentClasses = {
  signal: "from-signal-500 to-signal-700",
  grove: "from-teal-500 to-blue-600",
  ember: "from-ember-400 to-ember-600",
  ink: "from-ink-600 to-ink-900",
} as const;

/**
 * Homepage-only copy variant of ConceptPortfolio.tsx — see
 * HomeGrowthFramework.tsx's doc comment for why this split exists
 * (ConceptPortfolio.tsx is also rendered on /work, unchanged). Reuses
 * `conceptProjects` from site-config.ts as-is (never flagged for a
 * rewrite, and it's the same underlying project data /work shows) — only
 * this section's own framing text (heading, description, field label)
 * differs from the shared component.
 */
export function HomeConceptPortfolio() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Sample Transformations"
            title="What Growth Could Look Like for a Business Like Yours"
            description="These are concept projects, not real clients — a look at how we'd approach a business like yours."
            className="max-w-2xl"
          />
          <Button href="/work" variant="secondary" size="md" className="shrink-0">
            View All Work
          </Button>
        </div>

        {/*
          items-start below: cards report their own natural height instead
          of CSS grid's default row-stretch — a card whose title wraps to
          2-3 lines no longer forces every other card in that row to match
          its height, which was leaving noticeable empty space at the
          bottom of the shorter cards.
        */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {conceptProjects.map((project) => (
            <motion.article
              key={project.slug}
              variants={fadeUp}
              className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white"
            >
              {project.image ? (
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.imageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: project.imagePosition ?? "center" }}
                  />
                </div>
              ) : (
                <div className={`h-32 bg-gradient-to-br ${accentClasses[project.accentColor]}`} aria-hidden="true" />
              )}
              <div className="flex flex-1 flex-col p-6">
                {/*
                  Badge sits above the title on its own row instead of
                  sharing a horizontal row with it — putting them side by
                  side (title flex-1, badge shrink-0) used to squeeze the
                  title into whatever width the badge left over, and a
                  long single word like "Restaurant" or the first word of
                  "Professional Services Firm" would hit CSS's normal
                  word-wrap fallback and break mid-word once that shrunk
                  width was narrower than the word itself. Stacked, the
                  title always gets the card's full content width.
                */}
                <Badge tone="ink" className="w-fit">
                  {project.label}
                </Badge>
                <h3 className="mt-3 font-display text-display-md font-semibold text-ink-900">{project.industry}</h3>

                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-sm font-semibold text-ink-700">Challenge</dt>
                    <dd className="text-body text-ink-600">{project.challenge}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-ink-700">Our Approach</dt>
                    <dd className="text-body text-ink-600">{project.strategy}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-ink-700">Objective</dt>
                    <dd className="text-body text-ink-600">{project.objective}</dd>
                  </div>
                </dl>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-full bg-paper-300 px-3 py-1 text-xs font-medium text-ink-700"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
