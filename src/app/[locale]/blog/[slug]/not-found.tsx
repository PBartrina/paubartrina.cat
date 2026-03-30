import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function BlogPostNotFound() {
  const t = await getTranslations("blog");

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
      <p className="mb-4 font-mono text-6xl font-bold text-text-accent">404</p>
      <h1 className="mb-3 font-mono text-2xl font-bold text-text-primary">
        {t("notFoundTitle")}
      </h1>
      <p className="mb-10 font-mono text-text-secondary">
        {t("notFoundMessage")}
      </p>
      <Link
        href="/blog"
        className="font-mono text-sm text-text-accent hover:underline"
      >
        {t("notFoundBack")}
      </Link>
    </div>
  );
}
