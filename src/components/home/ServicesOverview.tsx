"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp, staggerChildren, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, LayoutTemplate, MessageCircle, Search, TrendingUp, type LucideIcon } from "lucide-react";
import Link from "next/link";

/**
 * Homepage capability groups — a presentation layer over the six services
 * in site-config.ts (unchanged there, still rendered flat on /services).
 * Websites is deliberately first and visually emphasized: it's the
 * foundation everything else connects to, not one of four equal-weight
 * service lines.
 */
const categories: {
  label: string;
  headline: string;
  blurb: string;
  tags: string[];
  href: string;
  cta: string;
  icon: LucideIcon;
  gradient: string;
  primary?: boolean;
}[] = [
  {
    label: "Websites",
    headline: "A Website You're Proud to Send People To",
    blurb: "Custom, mobile-friendly websites designed around your business and built to make the next step clear.",
    tags: ["Custom Design", "Mobile Ready", "Ongoing Support"],
    href: "/services/website-design",
    cta: "Explore Website Options",
    icon: LayoutTemplate,
    gradient: "from-teal-500 to-cyan-500",
    primary: true,
  },
  {
    label: "Google & Search",
    headline: "Help the Right Customers Find You",
    blurb: "Improve how your business appears in local search and on Google.",
    tags: ["Local SEO", "Google Business"],
    href: "/pricing",
    cta: "See Pricing",
    icon: Search,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    label: "AI & Automation",
    headline: "Make It Easier to Respond and Follow Up",
    blurb: "Use practical tools to answer questions, capture inquiries, and support customers when you're busy.",
    tags: ["AI Assistant", "Lead Capture"],
    href: "/pricing",
    cta: "See Pricing",
    icon: MessageCircle,
    gradient: "from-blue-600 to-violet-600",
  },
  {
    label: "Ongoing Growth",
    headline: "Keep Improving After Launch",
    blurb: "Ongoing support, analytics, and strategy to help your online presence keep moving forward.",
    tags: ["Analytics", "Optimization", "Support"],
    href: "/pricing",
    cta: "See Pricing",
    icon: TrendingUp,
    gradient: "from-violet-600 to-purple-700",
  },
];

export function ServicesOverview() {
  return (
    <section className="bg-paper-100 py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="What We Can Build for You"
          title="Start With a Better Website. Build From There."
          description="Your website is the foundation. From there, we can help more customers find you, make it easier for them to reach you, and connect the tools that support your business."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerChildren()}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <motion.div key={category.label} variants={fadeUp} className={cn(category.primary && "sm:col-span-2 lg:col-span-1")}>
              <Link
                href={category.href}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted",
                  category.primary
                    ? "border-transparent bg-gradient-to-br from-teal-50 via-white to-blue-50 ring-1 ring-blue-200"
                    : "border-ink-100 bg-white"
                )}
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
                  {category.cta}
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
