"use client";

import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/lib/site-config";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function ServicesOverview() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How We Help"
          title="Everything Your Business Needs to Grow Online, Organized Around Outcomes"
          description="Not a menu of technical deliverables. A set of tools built to move your business forward."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div key={service.slug} variants={fadeUp}>
              <Link
                href={service.href}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-grove-100 text-grove-700">
                  <Icon name={service.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-display font-semibold text-ink-900">
                  {service.headline}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                  {service.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-grove-700">
                  Learn more
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
