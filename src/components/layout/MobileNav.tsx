"use client";

import { Button } from "@/components/ui/Button";
import { hasPhone, navLinks, primaryCta, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-900"
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>

      <div
        id="mobile-nav-panel"
        className={cn(
          "fixed inset-0 top-[var(--header-h,64px)] z-40 bg-paper-100 transition-transform duration-300 ease-confident motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-6 py-8">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-4 text-xl font-display",
                    pathname === link.href ? "text-grove-700" : "text-ink-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4">
            <Button href={primaryCta.href} className="w-full" size="lg">
              {primaryCta.label}
            </Button>
            {hasPhone ? (
              <a
                href={`tel:${siteConfig.contact.phoneHref}`}
                className="text-center text-sm text-ink-600 underline underline-offset-4"
              >
                or call {siteConfig.contact.phone}
              </a>
            ) : null}
          </div>
        </nav>
      </div>
    </div>
  );
}
