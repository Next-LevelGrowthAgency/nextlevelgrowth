import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { insightPosts } from "@/lib/insights-content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical, plain-English guidance on websites, local SEO, and digital marketing for local businesses.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Practical Guidance, No Jargon"
        description="Straightforward articles on websites, local SEO, and digital marketing, written for business owners, not developers."
      />

      <Section tone="paper">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insightPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/insights/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted"
              >
                <Badge tone="signal" className="w-fit">
                  {post.category}
                </Badge>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>
                <p className="mt-4 text-xs font-medium text-ink-500">{post.readTime}</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
