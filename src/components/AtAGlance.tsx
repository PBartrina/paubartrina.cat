import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog";

interface AtAGlanceProps {
  latestPost: BlogPostMeta | null;
  locale: string;
}

export default async function AtAGlance({ latestPost, locale }: AtAGlanceProps) {
  const t = await getTranslations({ locale, namespace: "atAGlance" });
  const about = await getTranslations({ locale, namespace: "about" });

  const coreTech = t.raw("coreTech") as Array<{
    name: string;
    detail?: string;
  }>;
  const languages = about.raw("languages") as Array<{
    label: string;
    level: string;
  }>;

  const cardBase =
    "rounded-lg border border-card-border bg-card-bg p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden";

  return (
    <section id="about" className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Bio card */}
          <div className={`${cardBase} md:col-span-2 lg:col-span-2`}>
            <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-20">
              {"//"}
            </span>
            <p className="font-mono text-sm leading-relaxed text-text-secondary md:text-base">
              {about("bio")}
            </p>
          </div>

          {/* Core Stack card */}
          <div className={`${cardBase} md:col-span-2 lg:col-span-2`}>
            <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-20">
              {"{ }"}
            </span>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-text-accent">
              {t("coreStackTitle")}
            </p>
            <div className="flex flex-wrap gap-2">
              {coreTech.map((tech) => (
                <span
                  key={tech.name}
                  className="rounded-md border border-card-border bg-bg-primary px-3 py-1.5 font-mono text-sm text-text-primary"
                >
                  {tech.name}
                  {tech.detail && (
                    <span className="ml-1.5 text-text-accent">
                      {tech.detail}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Years of experience card */}
          <div
            className={`${cardBase} border-l-4 border-l-text-accent lg:col-span-1`}
          >
            <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-20">
              {"++"}
            </span>
            <p className="font-display text-4xl font-bold text-text-accent md:text-5xl">
              {t("yearsCount")}
            </p>
            <p className="mt-2 font-mono text-sm text-text-secondary">
              {t("yearsLabel")}
            </p>
          </div>

          {/* Languages card */}
          <div className={`${cardBase} lg:col-span-1`}>
            <span className="absolute right-4 top-4 font-mono text-lg text-text-secondary opacity-20">
              i18n
            </span>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-accent">
              {about("languagesLabel")}
            </p>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.label} className="font-mono text-sm">
                  <span className="text-text-primary">{lang.label}</span>
                  <span className="ml-2 text-text-accent">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest blog post card */}
          <div className={`${cardBase} md:col-span-2 lg:col-span-2`}>
            <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-20">
              {">_"}
            </span>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-accent">
              {t("latestPostTitle")}
            </p>
            {latestPost ? (
              <div>
                <Link
                  href={`/blog/${latestPost.slug}`}
                  className="font-display text-lg font-bold text-text-primary transition-colors hover:text-text-accent"
                >
                  {latestPost.title}
                </Link>
                <div className="mt-2 flex gap-3 font-mono text-xs text-text-secondary">
                  <time dateTime={latestPost.date}>
                    {new Date(latestPost.date).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>{latestPost.readingTime}</span>
                </div>
              </div>
            ) : (
              <p className="font-mono text-sm text-text-secondary">
                {t("noPostsYet")}
              </p>
            )}
          </div>

          {/* Contact CTA card */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-bg-dark p-6 text-text-on-dark md:col-span-2 md:flex-row lg:col-span-4">
            <p className="font-mono text-base">{t("ctaText")}</p>
            <Link
              href="/contacte"
              className="inline-block rounded-md border border-text-on-dark px-5 py-2.5 font-mono text-sm transition-colors hover:border-text-accent hover:text-text-accent"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
