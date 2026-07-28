import { Container } from "@/components/ui/Container";
import {
  footerLegalLinks,
  footerServiceLinks,
  navLinks,
  siteConfig,
} from "@/lib/site-config";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-800 bg-ink-900 text-paper-300">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg font-semibold text-paper-100">{siteConfig.shortName}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-400">
              Helping local businesses reach their next level through modern
              websites, local SEO, and smarter digital strategy.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={siteConfig.social.facebook}
                aria-label="Next Level Growth on Facebook"
                className="text-paper-400 hover:text-paper-100"
              >
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={siteConfig.social.instagram}
                aria-label="Next Level Growth on Instagram"
                className="text-paper-400 hover:text-paper-100"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                aria-label="Next Level Growth on LinkedIn"
                className="text-paper-400 hover:text-paper-100"
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-paper-500">Navigate</p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-paper-300 hover:text-paper-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-paper-500">Services</p>
            <ul className="mt-4 space-y-3">
              {footerServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-paper-300 hover:text-paper-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-paper-500">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-paper-300">
              <li>
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-paper-100">
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.contact.phoneHref}`} className="hover:text-paper-100">
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="text-paper-500">{siteConfig.contact.serviceArea}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink-800 pt-8 text-xs text-paper-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLegalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-paper-100">
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
