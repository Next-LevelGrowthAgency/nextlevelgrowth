import { insightPosts } from "@/lib/insights-content";
import { siteConfig } from "@/lib/site-config";
import type { MetadataRoute } from "next";

const staticRoutes = [
  "",
  "/services",
  "/services/website-design",
  "/services/local-seo",
  "/services/digital-marketing",
  "/services/automation-ai-chat",
  "/approach",
  "/work",
  "/about",
  "/growth-audit",
  "/contact",
  "/insights",
  "/privacy-policy",
  "/terms",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/growth-audit" ? 0.9 : 0.6,
  }));

  const insightEntries: MetadataRoute.Sitemap = insightPosts.map((post) => ({
    url: `${siteConfig.url}/insights/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...insightEntries];
}
