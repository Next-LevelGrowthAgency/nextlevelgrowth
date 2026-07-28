# Next Level Growth — Brand & Design System Reference

## Positioning

Next Level Growth helps local and service-based businesses attract more
customers, build credibility, and grow with confidence through modern
websites, local SEO, and smarter digital strategy. The brand promise:
**"We help local businesses reach their next level."**

## Voice

Confident, never arrogant. Inspiring, never cheesy. Clear, plain-English,
outcome-focused. Speaks directly to the business owner ("you," "your
business"). Avoids jargon, hype words, and guarantees. See the "Avoid"
list in the original creative brief for banned phrases (e.g. "cutting-edge
solutions," "unlock exponential success," "guaranteed results").

## Color system

| Token    | Role                                          |
|----------|-----------------------------------------------|
| `ink`    | Deep navy/near-black — authority, headings, dark sections |
| `paper`  | Warm off-white — openness, primary background |
| `stone`  | Neutral gray — structure, secondary text, borders |
| `signal` | Refined blue — trust, secondary actions, links |
| `grove`  | Controlled emerald — growth accent, primary CTAs |
| `ember`  | Warm accent — used sparingly for human warmth (badges, small details) |

Full 50–950 scales for each are defined in `tailwind.config.ts`. Primary
CTA buttons use `grove-600`/`grove-700`. Dark sections (Hero, Growth
Framework, Proof, Final CTA) use `ink-900`.

**Deliberately avoided:** neon overload, harsh red, generic bright startup
gradients, and green used reflexively "because the company says growth" —
`grove` is controlled and used with intention, not everywhere.

## Typography

- **Display / headings:** Fraunces (variable serif) — confident, editorial,
  distinctive without being difficult to read. Loaded via `next/font/google`
  as `--font-display`.
- **Body / UI:** Inter — clean, highly legible sans-serif. Loaded via
  `next/font/google` as `--font-sans`.
- Custom fluid type scale (`text-display-2xl` → `text-display-md`) defined
  in `tailwind.config.ts`, using `clamp()` for smooth mobile-to-desktop scaling.

## Motion principles

Defined centrally in `src/lib/motion.ts` (`fadeUp`, `fadeIn`,
`staggerChildren`). Motion is short-distance, no bounce, and scroll-in
(`whileInView`, triggered once). `useReducedMotion()` is checked in the
Hero, and global CSS in `globals.css` disables animation duration for
anyone with `prefers-reduced-motion: reduce`.

## Imagery approach

No licensed stock photography is used in this build (avoiding the "photos
of people pointing at laptops," handshake, rocket, and mountain clichés
called out in the creative brief). The Hero uses an original abstract SVG
"scattered signals converging into one growth path" visual built in code.
Concept portfolio cards use gradient color blocks rather than stock photos.
**Before launch:** if you want real photography, source images you have
proper licensing for and swap them into the relevant components — do not
add unlicensed stock photos.

## Logo

No logo file exists yet — the header currently renders the business name
as styled text (`font-display`). Replace `siteConfig.shortName` usage in
`Header.tsx` and `Footer.tsx` with an `<Image>` component once a logo is
designed.
