import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryCta } from "@/lib/site-config";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 text-paper-100 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600" />
      <Container className="max-w-2xl text-center">
        <h2 className="balance text-display-lg">Your Next Chapter Won&rsquo;t Build Itself.</h2>
        <p className="mt-5 text-subhead text-paper-300">
          Let&rsquo;s find out what&rsquo;s holding your business back online,
          and fix it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
          </Button>
          <Button href="/pricing" variant="secondary" size="lg" className="border-paper-400 text-paper-100 hover:bg-white/10">
            View Pricing
          </Button>
        </div>
        <p className="mt-5 text-body text-paper-400">
          No pressure. No confusing pitch. Just a clear conversation about your business.
        </p>
      </Container>
    </section>
  );
}
