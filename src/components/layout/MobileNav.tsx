"use client";

import { Button } from "@/components/ui/Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { hasPhone, navLinks, primaryCta, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * MOBILE NAV RELIABILITY REWRITE — see the sprint's root-cause writeup for
 * the full story. Two compounding bugs in the previous version:
 *
 * 1. The panel was a DOM descendant of Header's own `sticky z-50`
 *    wrapper, so its `z-40` was only meaningful within THAT stacking
 *    context, not globally — Growth Coach's launcher (`fixed z-50`,
 *    later in DOM order, a sibling under <body>) could render above it.
 * 2. `top: var(--header-h, 64px)` referenced a CSS variable that was
 *    never actually defined anywhere, silently falling back to a
 *    hard-coded 64px that didn't account for AnnouncementBar's height —
 *    so the panel's top ~32px sat underneath the still-visible sticky
 *    header, bleeding through exactly as reported, and only visibly
 *    "broken" when the header happened to be in its translucent
 *    scrolled state at the moment the menu opened (hence intermittent).
 *
 * Fixed structurally, not with a bigger z-index: the panel is now
 * portaled to document.body as a true top-level modal layer (see
 * --z-mobile-nav in globals.css — deliberately the highest tier in the
 * site's z-index system, above even Growth Coach's own sub-modals),
 * covers the ENTIRE viewport (no header-height offset to get wrong), and
 * is fully isolated from the page behind it: an iOS-safe scroll lock
 * (not just overflow:hidden), inert+aria-hidden on the background in
 * both directions, and the same focus-trap/dialog pattern already used
 * by GrowthCoachPanel.tsx.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  function handleOpen() {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    // Give the DOM a tick to actually apply the closed state before moving
    // focus back, same reasoning as GrowthCoach.tsx's handleClose.
    requestAnimationFrame(() => previouslyFocusedRef.current?.focus());
  }

  // Close whenever the route changes — covers forward navigation via a
  // menu link, and (since usePathname reacts to it) browser back/forward
  // too, since Next.js updates the pathname on both.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Defense-in-depth beyond the pathname effect above: a few different
  // ways stale "open" state could otherwise survive past the point where
  // it's still meaningful — restoring from the back/forward cache,
  // rotating the device mid-interaction, or the tab being backgrounded.
  // None of these are hard bugs on their own, but each is a plausible
  // route to the exact "looked fine last time, broken this time"
  // intermittency this sprint exists to eliminate.
  useEffect(() => {
    function forceClose() {
      setOpen(false);
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") forceClose();
    }
    window.addEventListener("pageshow", forceClose);
    window.addEventListener("orientationchange", forceClose);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", forceClose);
      window.removeEventListener("orientationchange", forceClose);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  useFocusTrap(panelRef, open);
  useScrollLock(open);

  // Background isolation: everything NOT inside the portaled panel gets
  // marked inert + aria-hidden while the menu is open, so Tab and screen
  // reader navigation can't reach it even though (unlike pointer events,
  // which the opaque full-viewport panel already blocks purely by
  // sitting on top of everything at the highest z-index in the site) focus
  // doesn't care about visual stacking. These four elements are the only
  // things actually reachable on a mobile viewport behind the panel — the
  // desktop nav/CTA in Header are already `hidden md:block` below the md
  // breakpoint, so they're not part of the tab order to begin with.
  useEffect(() => {
    const targets = [
      document.getElementById("main-content"),
      document.querySelector("footer"),
      document.getElementById("growth-coach-root"),
      document.getElementById("site-logo"),
    ].filter((el): el is HTMLElement => el !== null);

    for (const el of targets) {
      if (open) {
        el.inert = true;
        el.setAttribute("aria-hidden", "true");
      } else {
        el.inert = false;
        el.removeAttribute("aria-hidden");
      }
    }

    return () => {
      for (const el of targets) {
        el.inert = false;
        el.removeAttribute("aria-hidden");
      }
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/*
        The trigger button only renders here, in Header's own normal
        flow, while CLOSED. It deliberately does NOT double as the close
        control: Header's wrapper div has `position: sticky`, which
        creates a stacking context regardless of z-index, so anything
        nested inside it can never out-rank an unrelated sibling
        stacking context (like the portal below) no matter how high a
        z-index it's given — that's the exact bug this rewrite exists to
        fix, and giving this button a bigger number would have just
        reintroduced a variant of it (confirmed by the reliability test:
        it deadlocked the close click even at z-101). The panel gets its
        own close button instead, rendered inside the same portal as the
        rest of its content, where it can trivially sit on top of it.
      */}
      {!open ? (
        <button
          type="button"
          aria-expanded={false}
          aria-controls="mobile-nav-panel"
          aria-label="Open menu"
          onClick={handleOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-900"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : null}

      {mounted
        ? createPortal(
            <div
              ref={panelRef}
              id="mobile-nav-panel"
              role="dialog"
              aria-modal={open || undefined}
              aria-labelledby={titleId}
              inert={!open}
              aria-hidden={!open}
              tabIndex={-1}
              className={cn(
                "fixed inset-0 isolate z-[var(--z-mobile-nav)] flex h-[100dvh] w-screen flex-col overflow-hidden bg-paper-100 outline-none",
                "transition-transform duration-300 ease-confident motion-reduce:transition-none",
                open ? "translate-x-0" : "translate-x-full pointer-events-none"
              )}
            >
              <h2 id={titleId} className="sr-only">
                Mobile navigation
              </h2>
              <div className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))]">
                <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  {siteConfig.shortName}
                </Link>
                <button
                  type="button"
                  aria-expanded={true}
                  aria-controls="mobile-nav-panel"
                  aria-label="Close menu"
                  onClick={handleClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-900"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <nav
                aria-label="Mobile"
                className="flex flex-1 flex-col justify-between overflow-y-auto px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6"
              >
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
                      className="-my-3 inline-block py-3 text-center text-sm text-ink-600 underline underline-offset-4"
                    >
                      or call {siteConfig.contact.phone}
                    </a>
                  ) : null}
                </div>
              </nav>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
