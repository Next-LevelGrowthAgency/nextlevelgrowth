import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/** Compact hero used on every interior page (everything except the homepage). */
export function PageHero({ eyebrow, title, description, ctaLabel, ctaHref }: PageHeroProps) {
  return (
    <section className="border-b border-ink-100 bg-ink-900 py-20 text-paper-100 sm:py-28">
      <Container className="max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-grove-300">
          {eyebrow}
        </p>
        <h1 className="balance text-display-xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper-300">{description}</p>
        {ctaLabel && ctaHref ? (
          <div className="mt-8">
            <Button href={ctaHref} size="lg">
              {ctaLabel}
            </Button>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
