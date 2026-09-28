import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog";

/** Listing row for an essay — same shape as the essay rows on /log. */
export default function BlogCard({ post }: { post: BlogPostMeta }) {
  const t = useTranslations("blog");
  const tLog = useTranslations("log");
  const locale = useLocale();
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(post.date)
  );

  return (
    <article className="relative grid gap-1 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6">
      <Link
        href={`/blog/${post.slug}`}
        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-accent"
        aria-label={post.title}
      />
      <div className="font-mono text-xs text-text-secondary">
        <time dateTime={post.date}>{date}</time>
        <div className="mt-1">{t("readingTime", { count: post.readingTimeMinutes })}</div>
      </div>
      <div>
        <span className="mb-1 inline-block rounded-full border border-text-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-text-accent">
          {tLog("essay")}
        </span>
        <h2 className="font-display text-2xl font-bold text-text-primary">{post.title}</h2>
        <p className="mt-1 text-text-secondary">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border-color px-2.5 py-0.5 font-mono text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
