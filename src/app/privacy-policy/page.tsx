import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Next Level Growth handles the information you share with us.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="PLACEHOLDER — this page requires review by a qualified attorney before launch. It is not legal advice."
      />
      <Section tone="paper">
        <Container className="max-w-3xl space-y-6 text-ink-700">
          <p>
            This placeholder outlines the general structure a privacy policy
            for this site should cover: what information is collected (e.g.
            via the Growth Audit and contact forms), how it is used, whether
            it is shared with third parties (such as an email provider or
            CRM), how long it is retained, and how a visitor can request its
            deletion.
          </p>
          <p className="rounded-2xl border border-dashed border-ink-300 bg-paper-200 p-6 text-sm">
            Do not launch this site with this placeholder text in place of a
            real, attorney-reviewed privacy policy. If you collect data from
            residents of California, the EU/UK, or other regulated regions,
            additional disclosures (e.g. CCPA, GDPR) may be legally required.
          </p>
        </Container>
      </Section>
    </>
  );
}
