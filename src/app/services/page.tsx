import { Container } from "@/components/ui/Container";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { primaryCta, services } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, LayoutTemplate, MessageCircle, Search, TrendingUp, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website design, local SEO, digital marketing, automation, and ongoing growth support, built around your business goals, not a generic package.",
  alternates: { canonical: "/services" },
};

/**
 * Groups the six services (site-config.ts, unchanged) into four scannable
 * capability categories for this page's layout only — copy, slugs, and
 * hrefs are all read from `services`, never duplicated here.
 */
const categories: { id: string; label: string; slugs: string[]; icon: LucideIcon; gradient: string }[] = [
  { id: "websites", label: "Websites", slugs: ["website-design", "ongoing-support"], icon: LayoutTemplate, gradient: "from-teal-500 to-cyan-500" },
  { id: "search", label: "Search & Google", slugs: ["local-seo"], icon: Search, gradient: "from-cyan-500 to-blue-600" },
  { id: "ai", label: "AI & Automation", slugs: ["automation-ai-chat"], icon: MessageCircle, gradient: "from-blue-600 to-violet-600" },
  { id: "growth", label: "Digital Growth", slugs: ["digital-marketing", "growth-strategy"], icon: TrendingUp, gradient: "from-violet-600 to-purple-700" },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="A Website First. Everything Else Connects to It."
        description="Every service here supports the same goal: helping your business get discovered, build trust, and turn more visitors into customers."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="What We Do"
            title="Choose Where to Start: Everything Connects"
            description="Most clients begin with one priority and expand as momentum builds. Here's how each service moves your business forward."
          />

          <div className="mt-14 space-y-12">
            {categories.map((category) => {
              const categoryServices = services.filter((service) => category.slugs.includes(service.slug));
              if (categoryServices.length === 0) return null;
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white ${category.gradient}`}>
                      <category.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="text-eyebrow text-ink-500">{category.label}</p>
                  </div>

                  <div className={`mt-5 grid grid-cols-1 gap-6 ${categoryServices.length > 1 ? "lg:grid-cols-2" : "lg:max-w-xl"}`}>
                    {categoryServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={service.href}
                        className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
                      >
                        <h3 className="font-display text-xl font-semibold text-ink-900">{service.headline}</h3>
                        <p className="mt-2 text-ink-600">{service.description}</p>
                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                          Learn more
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
