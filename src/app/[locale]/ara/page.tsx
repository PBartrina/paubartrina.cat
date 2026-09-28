import { localeOgImage } from "@/lib/og";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import { getLastCommitDate, formatCommitDate } from "@/lib/git";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const richComponents = {
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
  code: (chunks: ReactNode) => <code>{chunks}</code>,
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ara" });

  const canonicalUrl = `https://paubartrina.cat/${locale}/ara`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://paubartrina.cat/${l}/ara`])
      ),
    },
    openGraph: {
      ...localeOgImage(locale),
      title: t("title"),
      description: t("description"),
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function AraPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "ara" });
  const priorityCount = (t.raw("priorities") as string[]).length;
  const excitementCount = (t.raw("excitement") as string[]).length;

  const rawDate = getLastCommitDate([
    "src/i18n/messages/ca.json",
    "src/app/[locale]/ara/page.tsx",
  ]);
  const lastUpdated = rawDate ? formatCommitDate(rawDate, locale) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold text-text-primary md:text-5xl">
        {t("heading")}
      </h1>
      {lastUpdated && (
        <p
          data-testid="last-updated"
          className="mb-10 font-mono text-xs text-text-secondary"
        >
          {t("lastUpdated", { date: lastUpdated })}
        </p>
      )}

      <div className="space-y-10 text-text-primary">
        <div className="space-y-4 text-lg leading-relaxed">
          <p>{t.rich("location", richComponents)}</p>
          <p>{t.rich("occupation", richComponents)}</p>
        </div>

        <section className="border-t border-border-color pt-8">
          <h2 className="mb-5 font-display text-2xl font-bold">
            {t("prioritiesHeading")}
          </h2>
          <div className="space-y-4 leading-relaxed">
            {Array.from({ length: priorityCount }, (_, i) => (
              <p key={i}>
                {t.rich(`priorities.${i}`, richComponents)}
              </p>
            ))}
          </div>
        </section>

        <section className="border-t border-border-color pt-8">
          <h2 className="mb-5 font-display text-2xl font-bold">
            {t("excitementHeading")}
          </h2>
          <div className="space-y-4 leading-relaxed">
            {Array.from({ length: excitementCount }, (_, i) => (
              <p key={i}>
                {t.rich(`excitement.${i}`, richComponents)}
              </p>
            ))}
          </div>
        </section>

        <p className="border-t border-border-color pt-8 text-sm italic text-text-secondary">
          {t.rich("footer", {
            link: (chunks: ReactNode) => (
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-accent underline hover:no-underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
