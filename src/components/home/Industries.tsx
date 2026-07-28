import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { industries } from "@/lib/site-config";

export function Industries() {
  return (
    <section className="bg-paper-200 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Who We Serve"
          title="Built for Local Businesses With Bigger Goals"
          description="From restaurants to real estate, our strategy adapts to your business — not the other way around."
        />

        <ul className="mt-10 flex flex-wrap gap-3">
          {industries.map((industry) => (
            <li
              key={industry.label}
              className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700"
            >
              {industry.label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
