# Next Level Growth — Website

A production-ready marketing site for **Next Level Growth**, a growth and
digital marketing company serving local and service-based businesses.

Built with Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion.

---

## ⚠️ Important: this project has not been built or run yet

This codebase was authored in a sandboxed environment **without access to
the npm registry**, so `npm install`, `npm run dev`, and `npm run build`
have not been executed or verified here. Every file was written carefully
by hand and reviewed for consistency, but you should treat first install
and first build as a normal part of setup — not a formality.

**Before you do anything else:**

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` and click through every page. If
`npm run build` or `npm run dev` surface any TypeScript/ESLint errors, they
will almost certainly be small (a missing import, a prop name mismatch) —
fix forward from the error message. See `ASSUMPTIONS.md` for a list of
known placeholders and judgment calls that may need your input.

---

## Getting started

### Requirements
- Node.js 20+ (Node 22 recommended)
- npm 10+

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Project structure

```
src/
  app/                     App Router pages, layouts, API routes
    services/              Services overview + 4 individual service pages
    growth-audit/           Dedicated conversion landing page
    api/
      growth-audit/         Growth Audit form submission handler
      contact/               Contact form submission handler
      chat/                  AI chat proxy (disabled until configured)
    sitemap.ts               Auto-generated sitemap.xml
    robots.ts                Auto-generated robots.txt
  components/
    layout/                 Header, MobileNav, Footer, AnnouncementBar
    ui/                     Design-system primitives (Button, Card, Section…)
    home/                   Homepage sections
    services/               Shared service-detail page template
    forms/                  GrowthAuditForm, ContactForm
    chat/                   ChatWidget (optional, off by default)
    seo/                    JSON-LD helper
  lib/
    site-config.ts          ⭐ Centralized content: business info, nav, services,
                             FAQs, concept projects, industries, etc.
    service-details.ts       Content for the 4 individual service pages
    insights-content.ts      Sample blog/Insights post content
    growth-audit-schema.ts   Shared Zod validation (client + server)
    schema.ts                JSON-LD schema builders
    motion.ts                Shared Framer Motion variants
    utils.ts                 `cn()` class-merging helper
  types/                    Shared TypeScript types
```

**To change site content** (business name, phone, nav labels, services,
FAQs, industries, concept projects), start with `src/lib/site-config.ts`.
See `CONTENT-GUIDE.md` for a full walkthrough.

---

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, "Add New Project" → import the repository.
3. Vercel auto-detects Next.js — no build settings need to change.
4. Add environment variables (copy from `.env.example`) in
   Project Settings → Environment Variables.
5. Deploy. Vercel's **Hobby** plan does not permit commercial use — once
   this is a live business site, you'll need the **Pro** plan.

---

## Before you launch — required steps

1. **Replace every PLACEHOLDER.** Search the codebase for `PLACEHOLDER` —
   business address, phone, social links, legal pages, and the About page
   founder bio all need real information. See `ASSUMPTIONS.md`.
2. **Wire up form delivery.** The Growth Audit and Contact forms validate
   and accept submissions today, but do not yet send them anywhere. Add
   an email provider or CRM integration in `src/app/api/growth-audit/route.ts`
   and `src/app/api/contact/route.ts` (see the TODO comments in each file).
3. **Add spam protection.** Wire up Cloudflare Turnstile or hCaptcha using
   the `TURNSTILE_*` variables in `.env.example` before launch.
4. **Have a lawyer review** `/privacy-policy`, `/terms`, and `/accessibility`
   — these currently contain structural placeholders, not real legal copy.
5. **Add real testimonials** to `testimonials` in `site-config.ts` once you
   have them — the component exists but intentionally renders nothing
   while the array is empty.
6. **Add real case studies** to replace the concept portfolio in `Work`,
   once you have actual client results.
7. **Decide on the AI chat widget.** It ships disabled
   (`NEXT_PUBLIC_CHAT_ENABLED=false`). Turning it on before
   `AI_CHAT_PROVIDER_API_KEY` is set will show a safe fallback message
   rather than a broken feature — see `src/app/api/chat/route.ts`.
8. **Run Lighthouse** and fix anything below "excellent" on Performance,
   Accessibility, Best Practices, and SEO.
9. **Set `NEXT_PUBLIC_SITE_URL`** to your real production domain — it
   drives canonical URLs, the sitemap, and Open Graph tags.

See `ASSUMPTIONS.md` for the complete list of placeholders and judgment
calls made while building this, and `CONTENT-GUIDE.md` for how to edit
text, add a service, add a concept project, or add a blog post.
