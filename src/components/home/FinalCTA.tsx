import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryCta } from "@/lib/site-config";

export function FinalCTA() {
  return (
    <section className="bg-ink-900 py-20 text-paper-100 sm:py-28">
      <Container className="max-w-2xl text-center">
        <h2 className="balance text-display-lg">Your Next Chapter Won&rsquo;t Build Itself.</h2>
        <p className="mt-5 text-lg leading-relaxed text-paper-300">
          Let&rsquo;s identify what is holding your online presence back and
          create a clearer path toward growth.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href={primaryCta.href} size="lg">
            Start With a Free Growth Audit
          </Button>
        </div>
        <p className="mt-5 text-sm text-paper-400">
          No pressure. No confusing pitch. Just a clear conversation about your business.
        </p>
      </Container>
    </section>
  );
}
