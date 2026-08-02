import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to an accessible website experience.",
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Accessibility Statement"
        description="We want this site to be usable for everyone, regardless of ability or the technology used to browse it."
      />
      <Section tone="paper">
        <Container className="max-w-3xl space-y-6 text-ink-700">
          <p>
            This site is built with semantic HTML, visible keyboard focus
            states, labeled form fields, sufficient color contrast, and
            support for reduced-motion preferences. We aim to meet WCAG 2.1
            AA guidelines.
          </p>
          <p>
            If you experience any difficulty accessing content on this site,
            please contact us at{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="text-grove-700 underline">
              {siteConfig.contact.email}
            </a>{" "}
            and we will work to address it.
          </p>
          <p className="rounded-2xl border border-dashed border-ink-300 bg-paper-200 p-6 text-sm">
            PLACEHOLDER: review this statement against your actual, tested
            accessibility conformance before launch.
          </p>
        </Container>
      </Section>
    </>
  );
}
