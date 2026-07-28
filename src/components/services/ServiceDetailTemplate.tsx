import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import { CTABanner } from "@/components/ui/CTABanner";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { primaryCta } from "@/lib/site-config";
import type { ServiceDetail } from "@/lib/service-details";
import { CheckCircle2 } from "lucide-react";

export function ServiceDetailTemplate({ service }: { service: ServiceDetail }) {
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: service.navTitle,
          description: service.heroDescription,
          url: `/services/${service.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.navTitle, url: `/services/${service.slug}` },
        ])}
      />

      <PageHero
        eyebrow={service.eyebrow}
        title={service.heroTitle}
        description={service.heroDescription}
        ctaLabel={primaryCta.label}
        ctaHref={primaryCta.href}
      />

      <Section tone="paper">
        <Container className="max-w-3xl">
          <p className="text-lg leading-relaxed text-ink-700">{service.overview}</p>
        </Container>
      </Section>

      <Section tone="transparent" className="bg-paper-200">
        <Container>
          <h2 className="text-display-md">What&rsquo;s Included</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-ink-100 bg-white p-6">
                <Icon name={pillar.icon} className="h-5 w-5 text-grove-600" />
                <h3 className="mt-4 font-display text-base font-semibold text-ink-900">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container className="max-w-3xl">
          <h2 className="text-display-md">What You Can Expect</h2>
          <ul className="mt-8 space-y-4">
            {service.outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-grove-600" aria-hidden="true" />
                <span className="text-ink-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
