import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getPostBySlug, getAvailableLocales } from "@/lib/blog";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";
import ReadingProgress from "@/components/ReadingProgress";
import CodeBlock from "@/components/CodeBlock";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of locales) {
    const slugs = getAllSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};

  const availableLocales = getAvailableLocales(slug);
  const canonicalUrl = `https://paubartrina.cat/${locale}/blog/${slug}`;
  const ogImageUrl = `https://paubartrina.cat/${locale}/blog/${slug}/opengraph-image`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        availableLocales.map((l) => [
          l,
          `https://paubartrina.cat/${l}/blog/${slug}`,
        ])
      ),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: locale,
    url: `https://paubartrina.cat/${locale}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: "Pau Bartrina",
      url: "https://paubartrina.cat",
    },
  };

  const { content } = await compileMDX({
    source: post.content,
    components: { pre: CodeBlock },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeHighlight, rehypeSlug],
      },
    },
  });

  return (
    <>
    <ReadingProgress />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
    />
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/blog"
        className="mb-8 inline-block font-mono text-sm text-text-accent hover:underline"
      >
        {t("backToList")}
      </Link>

      {/* Translation warning banner */}
      {locale !== "ca" && (
        <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t("translationWarning")}
          </p>
          <Link
            href={`/blog/${slug}`}
            locale="ca"
            className="mt-2 inline-block text-sm text-amber-600 hover:underline dark:text-amber-400"
          >
            {t("readOriginal")}
          </Link>
        </div>
      )}

      <header className="mb-8">
        <h1 className="mb-4 font-mono text-3xl font-bold text-text-primary md:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap gap-3 font-mono text-sm text-text-secondary">
          <time>{post.date}</time>
          <span>{post.readingTime}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-color px-3 py-1 font-mono text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <article className="prose prose-lg max-w-none">
        {content}
      </article>
    </div>
    </>
  );
}
