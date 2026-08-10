import { Container } from "@/components/ui/Container";
import {
  configuredSocialLinks,
  footerLegalLinks,
  footerServiceLinks,
  hasPhone,
  hasServiceArea,
  navLinks,
  siteConfig,
} from "@/lib/site-config";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

const SOCIAL_ICON = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin } as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-800 bg-ink-900 text-paper-300">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg font-semibold text-paper-100">{siteConfig.shortName}</p>
            <p className="mt-3 max-w-xs text-body text-paper-400">
              Helping local businesses reach their next level through modern
              websites, local SEO, and smarter digital strategy.
            </p>
            {configuredSocialLinks.length > 0 ? (
              <div className="mt-6 flex gap-4">
                {configuredSocialLinks.map(([platform, href]) => {
                  const Icon = SOCIAL_ICON[platform as keyof typeof SOCIAL_ICON];
                  if (!Icon) return null;
                  return (
                    <a
                      key={platform}
                      href={href}
                      aria-label={`${siteConfig.name} on ${platform}`}
                      className="-m-3 inline-flex items-center justify-center p-3 text-paper-400 hover:text-paper-100"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-eyebrow text-paper-500">Navigate.</p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="-my-3 inline-block py-3 text-sm text-paper-300 hover:text-paper-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-paper-500">Services</p>
            <ul className="mt-4 space-y-3">
              {footerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="-my-3 inline-block py-3 text-sm text-paper-300 hover:text-paper-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-eyebrow text-paper-500">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-paper-300">
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="-my-3 inline-block py-3 hover:text-paper-100">
                  {siteConfig.contact.email}
                </a>
              </li>
              {hasPhone ? (
                <li>
                  <a href={`tel:${siteConfig.contact.phoneHref}`} className="-my-3 inline-block py-3 hover:text-paper-100">
                    {siteConfig.contact.phone}
                  </a>
                </li>
              ) : null}
              {hasServiceArea ? <li className="text-paper-500">{siteConfig.contact.serviceArea}</li> : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink-800 pt-8 text-xs text-paper-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLegalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="-my-3 inline-block py-3 hover:text-paper-100">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
