import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { TERMS_OF_SERVICE_VERSION } from "@/lib/consent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of the Next Level Growth website.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        description="PLACEHOLDER: this page requires review by a qualified attorney before launch. It is not legal advice."
      />
      <Section tone="paper">
        <Container className="max-w-3xl space-y-6 text-ink-700">
          <p className="text-xs text-ink-500">
            Version {TERMS_OF_SERVICE_VERSION}. This version identifier is what gets recorded against a visitor's consent
            at the moment they submit a form — it changes whenever this page's content changes, so a stored consent
            record always points back to what this page said at the time.
          </p>
          <p>
            This placeholder outlines the general structure terms of service
            for this site should cover: acceptable use of the site,
            intellectual property, disclaimers of warranty, limitation of
            liability, and governing law.
          </p>
          <p className="rounded-2xl border border-dashed border-ink-300 bg-paper-200 p-6 text-sm">
            Do not launch this site with this placeholder text in place of
            real, attorney-reviewed terms.
          </p>
        </Container>
      </Section>
    </>
  );
}
