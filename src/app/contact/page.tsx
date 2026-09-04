import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { hasAddress, hasPhone, hasServiceArea, siteConfig } from "@/lib/site-config";
import { trackPackageClick, trackPageView } from "@/lib/site-analytics";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Next Level Growth. No pressure, no confusing pitch.",
  alternates: { canonical: "/contact" },
};

const packageLabels: Record<string, string> = {
  foundation: "Foundation",
  launch: "Launch",
  growth: "Growth",
  "next-level": "Next Level",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: packageSlug } = await searchParams;
  const packageLabel = packageSlug ? packageLabels[packageSlug] : undefined;
  const initialMessage = packageLabel ? `I'm interested in the ${packageLabel} package.` : undefined;

  await trackPageView("/contact");
  if (packageSlug && packageLabel) await trackPackageClick(packageSlug);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Start a Conversation"
        description="Have a question, or ready to talk through your business? Reach out below, or request a Free Growth Audit for a deeper look at your online presence."
      />

      <Section tone="paper" className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <Container className="relative grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-3xl border border-ink-100 bg-white p-7 shadow-soft sm:p-9">
            <h2 className="text-display-md">Send a Message</h2>
            <div className="mt-6">
              <ContactForm initialMessage={initialMessage} />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-display-md">Other Ways to Reach Us</h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-ink-900">Email</p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-ink-600 hover:text-ink-900">
                    {siteConfig.contact.email}
                  </a>
                </div>
              </li>
              {hasPhone ? (
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Phone className="h-5 w-5" aria-hidden="true" />
                  </span>
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
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
