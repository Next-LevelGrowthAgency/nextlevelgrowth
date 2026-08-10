"use client";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/Button";
import { navLinks, primaryCta, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // BUGFIX: re-sync on every route change, not just on mount. Header lives
  // in the root layout and never remounts between pages, so this effect
  // used to run exactly once (empty deps) and then depend entirely on a
  // future 'scroll' event to correct `scrolled` after a client-side
  // navigation. That's usually fine, but Next.js's own dev warning
  // ("Detected scroll-behavior: smooth... will no longer automatically
  // disable smooth scrolling during route transitions") confirms this
  // exact combination — smooth-scroll CSS (globals.css) plus App Router
  // route transitions — is a known timing-sensitive area. Explicitly
  // reading window.scrollY the instant the route changes removes the
  // race entirely, instead of trusting a scroll event to arrive in time.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <div className="sticky top-0 z-50">
      <AnnouncementBar />
      <header
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "border-ink-100 bg-paper-100/90 backdrop-blur-md"
            : "border-transparent bg-paper-100"
        )}
      >
        <div className="container-content flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink-900">
            {siteConfig.shortName}
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium",
                      pathname === link.href ? "text-grove-700" : "text-ink-700 hover:text-ink-900"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <Button href={primaryCta.href} size="md">
              {primaryCta.label}
            </Button>
          </div>

          <MobileNav />
        </div>
      </header>
    </div>
  );
}
