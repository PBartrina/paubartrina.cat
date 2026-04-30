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

  const ogImageUrl = "https://paubartrina.cat/og-default.png";
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
      title: t("title"),
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
      title: t("title"),
      description: t("description"),
      images: [ogImageUrl],
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
      <h1 className="mb-2 font-mono text-4xl font-bold text-text-primary">
        {t("heading")}
      </h1>
      {lastUpdated && (
        <p className="mb-8 font-mono text-sm text-text-secondary">
          {t("lastUpdated", { date: lastUpdated })}
        </p>
      )}

      <div className="space-y-8 font-mono text-text-primary">
        <p>{t.rich("location", richComponents)}</p>
        <p>{t.rich("occupation", richComponents)}</p>

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            {t("prioritiesHeading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {Array.from({ length: priorityCount }, (_, i) => (
              <p key={i}>
                {t.rich(`priorities.${i}`, richComponents)}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            {t("excitementHeading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {Array.from({ length: excitementCount }, (_, i) => (
              <p key={i}>
                {t.rich(`excitement.${i}`, richComponents)}
              </p>
            ))}
          </div>
        </section>

        <p className="mt-12 text-sm italic text-text-secondary">
          {t.rich("footer", {
            link: (chunks: ReactNode) => (
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-accent hover:underline"
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
