import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { primaryCta, services } from "@/lib/site-config";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website design, local SEO, digital marketing, automation, and ongoing growth support — built around your business goals, not a generic package.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="A Full Growth Ecosystem, Not a Pile of Add-Ons"
        description="Every service connects to the same goal: helping your business get discovered, build trust, and turn more visitors into customers. Start with one, or bring them together."
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container>
          <SectionHeading
            eyebrow="What We Do"
            title="Choose Where to Start — Everything Connects"
            description="Most clients begin with one priority and expand as momentum builds. Here's how each service moves your business forward."
          />

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={service.href}
                className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-grove-100 text-grove-700">
                  <Icon name={service.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink-900">
                  {service.headline}
                </h3>
                <p className="mt-2 text-ink-600">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-grove-700">
                  Learn more
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
