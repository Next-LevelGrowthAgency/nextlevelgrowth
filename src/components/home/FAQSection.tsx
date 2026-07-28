import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/site-config";

export function FAQSection() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="Common Questions"
          title="Answers Before You Ask"
          align="center"
          className="mx-auto"
        />
        <div className="mt-12">
          <Accordion items={faqs} />
        </div>
      </Container>
    </section>
  );
}
