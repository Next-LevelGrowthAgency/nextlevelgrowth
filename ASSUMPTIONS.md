# Assumptions, Placeholders & Next Steps

## Environment limitation (read this first)

This project was built in a sandboxed environment with **no access to the
npm registry** — `npm install`, `npm run dev`, and `npm run build` could
not be executed here. Every file was hand-authored and manually reviewed
(import statements were cross-checked, an automated brace/paren balance
check was run across every `.ts`/`.tsx` file), but **the project has not
been compiled or run yet.** Run `npm install && npm run dev` first thing
and treat any TypeScript/build errors as expected first-run cleanup rather
than a sign something is deeply wrong — they should be small and easy to
resolve from the error text.

Package versions in `package.json` use caret ranges (`^15.1.0`, etc.)
based on what was current knowledge at build time — `npm install` will
resolve to whatever compatible versions are actually latest when you run it.

## Placeholder business information (must replace before launch)

All in `src/lib/site-config.ts` unless noted:

- Email: `hello@nextlevelgrowth.com`
- Phone: `(555) 010-0142`
- Street address, city/state/zip, and service area — all literal
  `PLACEHOLDER` strings
- Social links (Facebook, Instagram, LinkedIn, Google) — all point to
  `PLACEHOLDER` URLs
- `NEXT_PUBLIC_SITE_URL` in `.env.example` — set to your real domain

## Placeholder content (intentional, per the creative brief)

- **Testimonials** — `testimonials` array in `site-config.ts` is empty on
  purpose. Do not add fabricated quotes.
- **Concept portfolio** ("Work" page + homepage) — 6 clearly labeled
  concept/demonstration projects, not real clients. Do not present as paid
  engagements.
- **Capability proof section** — uses capability statements (mobile-first,
  fast, accessible, etc.), not invented statistics like "300% more leads."
  Add real, verified metrics once you have case studies.
- **About page founder bio** — left as a visibly marked placeholder box.
  No name, background, or photo was invented.
- **Insights / blog posts** — 4 sample posts with placeholder body text,
  clearly marked "PLACEHOLDER ARTICLE" inline. Replace before launch.
- **Legal pages** (Privacy Policy, Terms, Accessibility Statement) —
  structural placeholders only, explicitly marked as requiring attorney
  review. Not legal advice.

## Not yet wired up (architecture in place, needs credentials)

- **Form delivery** — `/api/growth-audit` and `/api/contact` validate
  submissions and return success, but don't send anywhere yet (no email/CRM
  configured). See TODO comments in each route file and `.env.example`.
- **Spam protection** — Turnstile/hCaptcha env vars are stubbed in
  `.env.example` but not yet enforced server-side.
- **AI chat** — ships disabled (`NEXT_PUBLIC_CHAT_ENABLED=false` in
  `.env.example`). The widget, API route, rate limiting, and non-AI
  fallback all exist; only the actual AI provider call is a TODO in
  `src/app/api/chat/route.ts`.
- **Analytics** — no Google Analytics/GA4 snippet or Search Console
  verification is wired in yet. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` handling
  in `layout.tsx` once you have a measurement ID, and add conversion
  events on: Growth Audit submit, Contact submit, phone-number clicks,
  email-link clicks, and chatbot lead capture.
- **Rate limiting** on both form routes uses an in-memory `Map`, which only
  works within a single serverless instance and resets on redeploy. Fine
  for launch, but swap for a durable store (e.g. Upstash Redis) if abuse
  becomes a real concern.

## Design judgment calls worth knowing about

- **Imagery:** no stock photography was used anywhere (see `BRAND.md`).
  The Hero uses an original SVG illustration instead of a licensed photo,
  per the brief's instruction to avoid generic stock imagery.
- **Icons:** rendered dynamically by string name via a small `Icon`
  wrapper around `lucide-react`. If a name in `site-config.ts` doesn't
  match an actual lucide icon, it silently falls back to a neutral circle
  rather than crashing — worth a visual scan after first build to make
  sure every icon looks intentional.
- **Mobile nav focus trapping:** the mobile menu overlay hides background
  content visually, but does not fully trap keyboard focus (no `inert` /
  focus-trap library wired in). Acceptable for launch, but a good
  candidate for the accessibility hardening pass below.
- **Breadcrumb JSON-LD** is implemented for the 4 service detail pages as
  a representative example; extend the same pattern
  (`breadcrumbSchema()` in `src/lib/schema.ts`) to other deep pages if
  desired.

## Recommended next improvements (in priority order)

1. `npm install`, fix any first-build errors, and manually click through
   every route, form, and mobile breakpoint.
2. Replace all `PLACEHOLDER` business information.
3. Wire up Growth Audit + Contact form delivery (email or CRM).
4. Add Turnstile/hCaptcha spam protection to both forms.
5. Get real legal copy reviewed by an attorney.
6. Replace sample Insights posts with real, written articles.
7. Add real testimonials and real case studies as they become available.
8. Set up Google Analytics + Search Console, and wire conversion events.
9. Run Lighthouse and address anything below "excellent" across
   Performance, Accessibility, Best Practices, and SEO.
10. Consider a focus-trap library (e.g. `focus-trap-react`) for the
    mobile nav overlay.
11. Design a real logo and swap it in for the text wordmark in the header/footer.
12. If AI chat goes live, add real FAQ content to the system prompt and
    test the human-escalation path thoroughly before launch.
