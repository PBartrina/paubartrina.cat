import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import BlogList from "@/components/BlogList";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("heading"),
    description: t("description"),
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
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
        <BlogList posts={posts} allTagsLabel={t("allTags")} />
      )}
    </div>
  );
}
