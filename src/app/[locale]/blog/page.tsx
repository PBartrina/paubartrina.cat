import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";
import { locales } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  const ogImageUrl = "https://paubartrina.cat/og-default.png";
  const canonicalUrl = `https://paubartrina.cat/${locale}/blog`;

  return {
    title: t("heading"),
    description: t("description"),
    openGraph: {
      title: t("heading"),
      description: t("description"),
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Pau Bartrina – Senior Frontend Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("heading"),
      description: t("description"),
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 font-mono text-4xl font-bold text-text-primary">
        {t("heading")}
      </h1>

      {posts.length === 0 ? (
        <p className="font-mono text-text-secondary">{t("emptyState")}</p>
      ) : (
        <BlogList posts={posts} allTagsLabel={t("allTags")} selectedTag={tag} />
      )}
    </div>
  );
}
