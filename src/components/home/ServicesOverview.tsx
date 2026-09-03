"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { motion } from "framer-motion";
import { ArrowUpRight, LayoutTemplate, MessageCircle, Search, TrendingUp, type LucideIcon } from "lucide-react";
import Link from "next/link";

/**
 * Homepage capability groups — a presentation layer over the six services
 * in site-config.ts (unchanged there, and still rendered flat on
 * /services). Grouping into four categories gives the homepage a scannable
 * hierarchy instead of six equal-weight cards; copy is reused verbatim
 * from existing service descriptions, not rewritten.
 */
const categories: {
  label: string;
  headline: string;
  blurb: string;
  tags: string[];
  href: string;
  icon: LucideIcon;
  gradient: string;
}[] = [
  {
    label: "Websites",
    headline: "A website that works as hard as you do",
    blurb: "A website that makes people trust you and makes it easy to reach out — plus the ongoing care to keep it running.",
    tags: ["Custom design", "Mobile-first", "Ongoing care"],
    href: "/services/website-design",
    icon: LayoutTemplate,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    label: "Search & Google",
    headline: "Get found by the customers already looking",
    blurb: "Local SEO and Google Business Profile work that helps customers actually find you.",
    tags: ["Local SEO", "Google Business Profile"],
    href: "/services/local-seo",
    icon: Search,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    label: "AI & Automation",
    headline: "Never miss a customer, even after hours",
    blurb: "AI chat that answers questions and grabs customer info, even after hours.",
    tags: ["AI chat", "Lead capture"],
    href: "/services/automation-ai-chat",
    icon: MessageCircle,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    label: "Digital Growth",
    headline: "Turn visitors into calls and booked jobs",
    blurb: "Digital marketing and strategy that turns more visitors into calls, forms, and booked jobs.",
    tags: ["Strategy", "Analytics", "Conversion"],
    href: "/services/digital-marketing",
    icon: TrendingUp,
    gradient: "from-violet-600 to-purple-700",
  },
];

export function ServicesOverview() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How We Help"
          title="The Tools Your Business Actually Needs to Grow"
          description="We don&rsquo;t sell technology for technology&rsquo;s sake. Everything here exists to bring in more customers."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div key={category.label} variants={fadeUp}>
              <Link
                href={category.href}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white ${category.gradient}`}>
                  <category.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-eyebrow text-ink-500">{category.label}</p>
                <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink-900">
                  {category.headline}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{category.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {category.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-paper-200 px-2.5 py-1 text-xs font-medium text-ink-600">
                      {tag}
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
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
