import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog";

interface PostNavigationProps {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
  locale: string;
}

export default async function PostNavigation({
  prev,
  next,
  locale,
}: PostNavigationProps) {
  const t = await getTranslations({ locale, namespace: "blog" });

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Post navigation"
      className="mt-12 flex items-start justify-between gap-4 border-t border-border-color pt-8 font-mono text-sm"
    >
      <div className="flex-1">
        {prev && (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col gap-1 text-text-secondary hover:text-text-accent"
          >
            <span className="text-xs text-text-accent">{t("prevPost")}</span>
            <span className="line-clamp-2 transition-colors group-hover:text-text-accent">
              {prev.title}
            </span>
          </Link>
        )}
      </div>

      <div className="flex-1 text-right">
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col gap-1 text-text-secondary hover:text-text-accent"
          >
            <span className="text-xs text-text-accent">{t("nextPost")}</span>
            <span className="line-clamp-2 transition-colors group-hover:text-text-accent">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
