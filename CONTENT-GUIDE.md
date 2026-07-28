# Content Replacement Guide

Almost every piece of editable content lives in `src/lib/*.ts` files, not
scattered across components. You should rarely need to touch a `.tsx`
component file just to change text, add a service, or update contact info.

## Business info, nav, contact details

Edit `src/lib/site-config.ts`:

- `siteConfig.contact` — email, phone, address, service area
- `siteConfig.social` — social profile URLs
- `navLinks` / `footerServiceLinks` / `footerLegalLinks` — navigation
- `primaryCta` / `secondaryCta` — the two main CTAs used everywhere
- `announcementBarMessage` / `trustStatement` — small recurring copy snippets

## Services (the 6 homepage service cards)

Edit the `services` array in `site-config.ts`. Each entry needs a `slug`,
`headline`, `description`, a `lucide-react` icon name, and an `href`.

## The 4 detailed service pages

Edit `src/lib/service-details.ts`. Each key (`website-design`, `local-seo`,
`digital-marketing`, `automation-ai-chat`) has a hero, an overview
paragraph, a list of "pillars" (what's included), and a list of outcomes.
The pages themselves (`src/app/services/*/page.tsx`) are thin wrappers
around `ServiceDetailTemplate` — you shouldn't need to edit them.

## The Growth Framework (5-stage process)

Edit `frameworkStages` in `site-config.ts`.

## Why Us / differentiators

Edit `differentiators` in `site-config.ts`.

## Concept portfolio ("Work" page + homepage)

Edit `conceptProjects` in `site-config.ts`. **Do not add fabricated client
work, revenue figures, or results here.** Every entry must keep its
`label` as `"Concept Project"`, `"Demonstration Build"`, or
`"Sample Transformation"` — never presented as a real paid engagement.
Once you have real case studies, replace these entries and update the
label accordingly (e.g. add a `"Client Project"` label and treat it
differently in `ConceptPortfolio.tsx` if you want a visual distinction).

## FAQs

Edit `faqs` in `site-config.ts`. These automatically populate both the
homepage FAQ accordion and the FAQPage JSON-LD schema.

## Testimonials

Edit `testimonials` in `site-config.ts`. **This array is empty on
purpose.** The `Testimonials` component renders nothing when it's empty.
Do not fill it with invented quotes — only add real, verified testimonials
you have permission to publish.

## Industries served

Edit `industries` in `site-config.ts`.

## Insights / blog posts

Edit `src/lib/insights-content.ts`. Each post needs a unique `slug`,
`title`, `excerpt`, `category`, `readTime`, and a `body` array of
paragraphs. Adding an entry automatically creates a page at
`/insights/[slug]` and adds it to the sitemap.

All 4 existing posts are placeholder topics with placeholder body text —
replace the `body` arrays with real written content before launch.

**Moving to a headless CMS later:** keep the `InsightPost` type in
`insights-content.ts` as the contract, and swap the static array for a
fetch call (e.g. to Sanity, Contentful, or an MDX loader) — the page
components don't need to change.

## Legal pages

`src/app/privacy-policy`, `src/app/terms`, and `src/app/accessibility`
contain structural placeholders only. Replace with real, attorney-reviewed
copy before launch — do not publish the placeholder text as-is.

## About page / founder bio

`src/app/about/page.tsx` has a clearly marked placeholder box for a
founder or team bio. Replace it with real information — we deliberately
did not invent a name, background, or photo.

## Adding a brand-new page

1. Create `src/app/your-route/page.tsx`.
2. Export `metadata` (title, description, `alternates.canonical`).
3. Use `PageHero`, `Section`, `Container`, and `CTABanner` from
   `src/components/ui/` to stay visually consistent with the rest of the site.
4. Add the route to `staticRoutes` in `src/app/sitemap.ts`.
5. If it should appear in navigation, add it to `navLinks` in `site-config.ts`.
