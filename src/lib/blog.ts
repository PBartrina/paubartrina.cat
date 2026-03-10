import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { locales } from "@/i18n/config";

const BLOG_DIR = (locale: string) =>
  path.join(process.cwd(), "content", "blog", locale);

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  published: boolean;
  readingTime: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

export function getAllPosts(locale: string): BlogPostMeta[] {
  const dir = BLOG_DIR(locale);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);

      if (process.env.NODE_ENV === "production" && data.published === false) {
        return null;
      }

      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        description: data.description || "",
        tags: data.tags || [],
        readingTime: readingTime(content).text,
      };
    })
    .filter(Boolean) as BlogPostMeta[];

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(
  locale: string,
  slug: string
): BlogPost | null {
  const filePath = path.join(BLOG_DIR(locale), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    description: data.description || "",
    tags: data.tags || [],
    published: data.published !== false,
    readingTime: readingTime(content).text,
    content,
  };
}

export function getAllSlugs(locale: string): string[] {
  const dir = BLOG_DIR(locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Returns which locales have a blog post with the given slug.
 * Used for hreflang alternates and the language switcher on blog posts.
 */
export function getAvailableLocales(slug: string): string[] {
  return locales.filter((locale) => {
    const filePath = path.join(BLOG_DIR(locale), `${slug}.mdx`);
    return fs.existsSync(filePath);
  });
}
