export type InsightPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  body: string[];
};

/**
 * PLACEHOLDER content structure for the Insights / blog section.
 *
 * These are illustrative topics only — replace with real, written articles
 * before launch. The shape here (slug, title, excerpt, category, body[])
 * is intentionally simple so it can be swapped for a headless CMS (e.g.
 * Sanity, Contentful, or MDX files) later without changing page structure.
 * See CONTENT-GUIDE.md.
 */
export const insightPosts: InsightPost[] = [
  {
    slug: "what-is-a-growth-audit",
    title: "What Actually Happens During a Free Growth Audit?",
    excerpt:
      "A plain-English walkthrough of what we look at, what you'll walk away with, and why there's no pressure attached.",
    category: "Getting Started",
    readTime: "4 min read",
    body: [
      "PLACEHOLDER ARTICLE: replace with real written content before launch.",
      "A Growth Audit looks at three things: your website, your local search visibility, and how well your current site captures leads. You'll get clear, honest observations, not a sales pitch.",
    ],
  },
  {
    slug: "local-seo-basics-for-small-business",
    title: "Local SEO Basics Every Small Business Owner Should Know",
    excerpt:
      "The handful of fundamentals that actually move the needle for local search visibility. No jargon required.",
    category: "Local SEO",
    readTime: "6 min read",
    body: [
      "PLACEHOLDER ARTICLE: replace with real written content before launch.",
      "Local SEO comes down to a few fundamentals: an accurate, complete Google Business Profile, consistent business information across the web, and a website that clearly explains what you do and where you do it.",
    ],
  },
  {
    slug: "does-my-business-need-a-new-website",
    title: "Does Your Business Actually Need a New Website?",
    excerpt:
      "Not every business needs a rebuild. Here's how to tell the difference between 'needs a refresh' and 'needs to start over.'",
    category: "Website Design",
    readTime: "5 min read",
    body: [
      "PLACEHOLDER ARTICLE: replace with real written content before launch.",
      "Sometimes the right move is targeted improvements: better calls to action, faster load times, clearer navigation. Sometimes the foundation genuinely needs to be rebuilt. A short audit usually makes it obvious which situation you're in.",
    ],
  },
  {
    slug: "ai-chat-without-losing-the-human-touch",
    title: "Using AI Chat Without Losing the Human Touch",
    excerpt:
      "How to use automation to capture more leads while still feeling like a real, trustworthy local business.",
    category: "Automation",
    readTime: "5 min read",
    body: [
      "PLACEHOLDER ARTICLE: replace with real written content before launch.",
      "The goal of AI chat isn't to replace conversations with your customers. It's to make sure no inquiry goes unanswered. Done well, it should always disclose that it's a virtual assistant and hand off to a person quickly.",
    ],
  },
];
