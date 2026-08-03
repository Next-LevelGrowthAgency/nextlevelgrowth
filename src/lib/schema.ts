import { hasAddress, hasPhone, hasServiceArea, siteConfig } from "@/lib/site-config";

/**
 * Organization / ProfessionalService schema for the whole site. Phone,
 * address, service area, and social profiles are only included once
 * they're configured with real values in site-config.ts — omitted
 * entirely rather than emitting structured data that asserts a fake
 * phone number or address to search engines.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    ...(hasPhone && { telephone: siteConfig.contact.phone }),
    ...(hasAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.contact.addressLine1,
        addressLocality: siteConfig.contact.addressLine2,
      },
    }),
    ...(hasServiceArea && { areaServed: siteConfig.contact.serviceArea }),
    ...(Object.values(siteConfig.social).some(Boolean) && { sameAs: Object.values(siteConfig.social).filter(Boolean) }),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}

export function serviceSchema(input: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    description: input.description,
    url: `${siteConfig.url}${input.url}`,
    provider: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
    },
  };
}
