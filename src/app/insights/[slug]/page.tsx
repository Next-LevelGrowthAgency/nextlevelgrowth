import { Badge } from "@/components/ui/Badge";
import { CTABanner } from "@/components/ui/CTABanner";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { insightPosts } from "@/lib/insights-content";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageParams = { slug: string };

export function generateStaticParams() {
  return insightPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = insightPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/insights/${post.slug}` },
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = insightPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Section tone="paper" className="pb-0">
        <Container className="max-w-2xl">
          <Link href="/insights" className="text-sm font-medium text-grove-700">
            ← Back to Insights
          </Link>
          <Badge tone="signal" className="mt-6 w-fit">
            {post.category}
          </Badge>
          <h1 className="mt-4 text-display-lg">{post.title}</h1>
          <p className="mt-3 text-sm text-ink-500">{post.readTime}</p>
        </Container>
      </Section>

      <Section tone="paper">
        <Container className="max-w-2xl space-y-5 text-lg leading-relaxed text-ink-700">
          {post.body.map((paragraph, index) => (
            <p key={index} className={index === 0 ? "italic text-ink-500" : undefined}>
              {paragraph}
            </p>
          ))}
        </Container>
      </Section>

      <CTABanner />
    </>
  );
}
