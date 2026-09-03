import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryCta } from "@/lib/site-config";

export function CTABanner({
  title = "Ready to see what's possible for your business?",
  description = "Start with a free, no-pressure Growth Audit. We'll show you exactly where the opportunity is.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 py-16 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600" />
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-2 max-w-xl text-paper-300">{description}</p>
        </div>
        <Button href={primaryCta.href} variant="inverse" size="lg" className="shrink-0">
          {primaryCta.label}
        </Button>
      </Container>
    </section>
  );
}
