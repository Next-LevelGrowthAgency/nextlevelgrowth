import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PricingFinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 text-paper-100 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600"
      />
      <Container className="max-w-2xl text-center">
        <h2 className="balance text-display-lg">Ready to Take Your Business to the Next Level?</h2>
        <p className="mt-5 text-subhead text-paper-300">
          Tell us what you want to build, improve, or grow. We&rsquo;ll help you determine the right package or
          custom solution.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Button href="/contact" size="lg" className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white shadow-soft hover:opacity-95 hover:shadow-lifted">
            Get Started
          </Button>
          <Button href="/contact" variant="secondary" size="lg" className="border-paper-400 text-paper-100 hover:bg-white/10">
            Contact Us
          </Button>
        </div>
      </Container>
    </section>
  );
}
