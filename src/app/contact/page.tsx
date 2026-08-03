import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { hasAddress, hasPhone, hasServiceArea, siteConfig } from "@/lib/site-config";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Next Level Growth. No pressure, no confusing pitch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Start a Conversation"
        description="Have a question, or ready to talk through your business? Reach out below, or request a Free Growth Audit for a deeper look at your online presence."
      />

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-display-md">Send a Message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-display-md">Other Ways to Reach Us</h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-grove-600" aria-hidden="true" />
                <div>
                  <p className="font-medium text-ink-900">Email</p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-ink-600 hover:text-ink-900">
                    {siteConfig.contact.email}
                  </a>
                </div>
              </li>
              {hasPhone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-grove-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-ink-900">Phone</p>
                    <a href={`tel:${siteConfig.contact.phoneHref}`} className="text-ink-600 hover:text-ink-900">
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                </li>
              ) : null}
              {hasServiceArea || hasAddress ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-grove-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-ink-900">Service Area</p>
                    {hasServiceArea ? <p className="text-ink-600">{siteConfig.contact.serviceArea}</p> : null}
                    {hasAddress ? (
                      <p className="mt-1 text-xs text-ink-500">
                        {siteConfig.contact.addressLine1}, {siteConfig.contact.addressLine2}
                      </p>
                    ) : null}
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
