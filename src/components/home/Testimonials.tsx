import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial } from "@/types";

/**
 * Reusable testimonial component. NOT rendered on the homepage or anywhere
 * else until real, verified testimonials are added to `testimonials` in
 * site-config.ts — the array is empty on purpose. Do not fabricate quotes.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <section className="bg-paper-200 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow="Client Voices" title="What Business Owners Say" align="center" className="mx-auto" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.name} className="rounded-2xl bg-white p-7">
              <blockquote className="text-ink-700">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-ink-900">
                {item.name}
                <span className="block font-normal text-ink-500">
                  {item.role}, {item.company}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
