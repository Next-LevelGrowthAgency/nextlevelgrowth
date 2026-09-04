import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Short, deliberately compact transition between the service cards and
 * the (dark) process section right after it — a single beat, not another
 * full section with its own heading/body/cards/CTA sprawl. Kept light
 * with a soft gradient wash rather than a dark band, so it doesn't stack
 * two dark sections back to back with HomeGrowthFramework below it.
 */
export function HomeEmotionalBridge() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-paper-100 to-purple-50 py-14 sm:py-20">
      <Container className="max-w-2xl text-center">
        <p className="text-eyebrow mb-3 text-gradient-brand">The Goal</p>
        <h2 className="balance text-display-md text-ink-900">A Website That Finally Feels Like Your Business.</h2>
        <p className="mt-4 text-body text-ink-600">
          Professional. Clear. Easy to use. Built to give customers confidence when they find you
          online.
        </p>
        <div className="mt-7">
          <Button href="/growth-audit" size="lg" className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white shadow-soft hover:opacity-95 hover:shadow-lifted">
            Let&rsquo;s Build It
          </Button>
        </div>
      </Container>
    </section>
  );
}
