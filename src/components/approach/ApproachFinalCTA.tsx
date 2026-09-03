import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function ApproachFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 text-paper-100 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600" />
      <Container className="max-w-2xl text-center">
        <p className="text-eyebrow mb-4 text-teal-300">Ready to Move Forward?</p>
        <h2 className="balance text-display-lg">Your Next Level Starts With a Clear First Step.</h2>
        <p className="mt-5 text-subhead text-paper-300">
          Tell us where your business is today and where you want it to go. We&rsquo;ll help you
          identify the right place to start.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Button href="/growth-audit" size="lg" className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white shadow-soft hover:opacity-95 hover:shadow-lifted">
            Get Your Free Growth Audit
          </Button>
          <Button href="/pricing" variant="secondary" size="lg" className="border-paper-400 text-paper-100 hover:bg-white/10">
            View Pricing
          </Button>
        </div>
      </Container>
    </section>
  );
}
