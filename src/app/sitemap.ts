import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { locales } from "@/i18n/config";

const BASE_URL = "https://paubartrina.cat";

type Locale = (typeof locales)[number];

const staticRoutes = ["", "/blog", "/contacte", "/uses", "/ara"] as const;

function alternates(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static routes
  for (const locale of locales as readonly Locale[]) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1.0 : 0.8,
        alternates: {
          languages: alternates(route),
        },
      });
    }
  }

  // Blog posts
  for (const locale of locales as readonly Locale[]) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: alternates(`/blog/${post.slug}`),
        },
      });
    }
  }

  return entries;
}
