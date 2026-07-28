import { GrowthAuditForm } from "@/components/forms/GrowthAuditForm";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Growth Audit",
  description:
    "Request a free, no-pressure review of your website, local search visibility, and lead capture — with honest, clear recommendations.",
  alternates: { canonical: "/growth-audit" },
};

const whatYouGet = [
  {
    icon: "Search",
    title: "A clear look at your online presence",
    description: "Website, local search visibility, and lead-capture all reviewed together.",
  },
  {
    icon: "MessageSquareText",
    title: "Honest, plain-English feedback",
    description: "No jargon, no pressure — just a clear picture of what's working and what isn't.",
  },
  {
    icon: "ListChecks",
    title: "A short list of next steps",
    description: "Practical recommendations you can act on, whether or not you work with us.",
  },
];

export default function GrowthAuditPage() {
  return (
    <section className="bg-paper-100 py-20 sm:py-28">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-grove-700">
            Free Growth Audit
          </p>
          <h1 className="balance mt-4 text-display-xl text-ink-900">
            See Exactly Where the Opportunity Is
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            A few minutes now gets you a clear, no-pressure look at what&rsquo;s
            helping your business grow online — and what&rsquo;s holding it
            back.
          </p>

          <ul className="mt-10 space-y-6">
            {whatYouGet.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-grove-100 text-grove-700">
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <GrowthAuditForm />
      </Container>
    </section>
  );
}
