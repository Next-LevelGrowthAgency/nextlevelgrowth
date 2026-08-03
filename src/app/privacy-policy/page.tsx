import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Next Level Growth handles the information you share with us.",
  alternates: { canonical: "/privacy-policy" },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl font-semibold text-ink-900">{children}</h2>;
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect the information you share with the Growth Coach, the Growth Audit form, and the contact form."
      />
      <Section tone="paper">
        <Container className="max-w-3xl space-y-8 text-ink-700">
          <p className="rounded-2xl border border-dashed border-ink-300 bg-paper-200 p-6 text-sm">
            This policy is written in plain language to be genuinely useful, but it has not been reviewed by an
            attorney. We recommend legal review before broad public launch, especially if you collect information
            from residents of California, the EU/UK, or other regions with specific privacy requirements (CCPA,
            GDPR, etc.), and before relying on it for email marketing, phone outreach, or SMS consent.
          </p>

          <div className="space-y-3">
            <H2>Information we collect</H2>
            <p>
              We collect what you choose to share through the Growth Coach conversation, the Growth Score assessment,
              the Growth Audit form, and the contact form: your name, email, phone number (optional), business
              details, and the answers you give during a coaching conversation or assessment. We ask that you not
              submit passwords, banking information, Social Security numbers, or other highly sensitive information,
              and we automatically screen submissions for common patterns of this kind and reject them.
            </p>
          </div>

          <div className="space-y-3">
            <H2>How we use it</H2>
            <p>
              We use the information you provide to personalize your Growth Score results and Business Growth
              Report, respond to your request, deliver the plan you asked for by email, and — only with your
              separate, explicit permission — follow up by email, phone, or text. We never combine these into a
              single "yes to everything" checkbox; each is requested and recorded individually.
            </p>
          </div>

          <div className="space-y-3">
            <H2>Service providers</H2>
            <p>
              We use Resend to deliver transactional emails (your requested report and our internal lead
              notification). Once a durable database is configured, lead and assessment records are stored with
              Supabase (Postgres). Until then, submissions may be held only in server memory for the current session.
              We do not sell your information, and we do not share it with third parties for their own marketing
              purposes.
            </p>
          </div>

          <div className="space-y-3">
            <H2>Analytics</H2>
            <p>
              We track coarse product-usage events (e.g. "assessment started," "report generated") to understand how
              the Growth Coach is used. These events never include your name, email, phone number, message content,
              or specific business details — only the event name and a count.
            </p>
          </div>

          <div className="space-y-3">
            <H2>Retention and deletion</H2>
            <p>
              We retain lead and assessment records for as long as reasonably useful for following up on your
              request and improving our services, or until you ask us to delete them. To request deletion or a copy
              of your data, email{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="underline hover:text-ink-900">
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </div>

          <div className="space-y-3">
            <H2>Security</H2>
            <p>
              Submissions are validated and rate-limited server-side, sensitive-looking input (passwords, card
              numbers, SSNs) is rejected automatically, and administrative access to lead data requires
              authentication that is fully disabled in production until a real authentication provider is
              connected. No system is perfectly secure, and we can't guarantee absolute security of information
              transmitted to us.
            </p>
          </div>

          <div className="space-y-3">
            <H2>Not licensed professional advice</H2>
            <p>
              Next Level Growth Coach provides educational business, marketing, and technology guidance. It does not
              provide legal, tax, accounting, investment, medical, or other licensed professional advice, and using
              it does not create any kind of professional relationship.
            </p>
          </div>

          <div className="space-y-3">
            <H2>Contact</H2>
            <p>
              Questions about this policy or your information can be sent to{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="underline hover:text-ink-900">
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
