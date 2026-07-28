import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="bg-paper-100 py-28">
      <Container className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-grove-700">404</p>
        <h1 className="mt-4 text-display-lg">This Page Took a Different Path.</h1>
        <p className="mt-4 text-lg text-ink-600">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/">Back to Home</Button>
        </div>
      </Container>
    </section>
  );
}
