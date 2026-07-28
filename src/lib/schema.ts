import { siteConfig } from "@/lib/site-config";

/**
 * Organization / ProfessionalService schema for the whole site.
 * PLACEHOLDER values (address, geo) must be filled in with verified data
 * before launch — see CONTENT-GUIDE.md.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.addressLine1,
      addressLocality: siteConfig.contact.addressLine2,
    },
    areaServed: siteConfig.contact.serviceArea,
    sameAs: Object.values(siteConfig.social),
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
