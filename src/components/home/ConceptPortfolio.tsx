"use client";

import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { conceptProjects } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";

const accentClasses = {
  signal: "from-signal-500 to-signal-700",
  grove: "from-grove-500 to-grove-700",
  ember: "from-ember-400 to-ember-600",
  ink: "from-ink-600 to-ink-900",
} as const;

/**
 * Concept portfolio. These are clearly labeled as demonstration projects —
 * never presented as real, paid client work. See site-config.ts for the
 * "do not fabricate" policy this section follows.
 */
export function ConceptPortfolio() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Sample Transformations"
            title="What Growth Could Look Like for a Business Like Yours"
            description="Concept builds created to demonstrate strategy and craft — clearly labeled, not real client engagements."
            className="max-w-2xl"
          />
          <Button href="/work" variant="secondary" size="md" className="shrink-0">
            View All Work
          </Button>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {conceptProjects.map((project) => (
            <motion.article
              key={project.slug}
              variants={fadeUp}
              className="flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white"
            >
              <div className={`h-32 bg-gradient-to-br ${accentClasses[project.accentColor]}`} aria-hidden="true" />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink-900">
                    {project.industry}
                  </h3>
                  <Badge tone="ink">{project.label}</Badge>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-ink-700">Challenge</dt>
                    <dd className="text-ink-600">{project.challenge}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-700">Strategic Direction</dt>
                    <dd className="text-ink-600">{project.strategy}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-700">Objective</dt>
                    <dd className="text-ink-600">{project.objective}</dd>
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
