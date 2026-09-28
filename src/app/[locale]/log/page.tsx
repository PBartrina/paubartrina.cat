import { localeOgImage } from "@/lib/og";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LogEntry, { entryKey } from "@/components/LogEntry";
import { locales } from "@/i18n/config";
import { getLogEntries } from "@/lib/log";

const BASE_URL = "https://paubartrina.cat";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "log" });
  const canonicalUrl = `${BASE_URL}/${locale}/log`;
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/log`])),
    },
    openGraph: {
      ...localeOgImage(locale), title: t("title"), description: t("description"), url: canonicalUrl, type: "website" },
  };
}

export default async function LogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "log" });
  const entries = await getLogEntries(locale);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-2 flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-4xl font-bold text-text-primary">{t("heading")}</h1>
        {entries.length > 0 && (
          <span className="font-mono text-sm text-text-secondary">
            {t("entryCount", { count: entries.length })}
          </span>
        )}
      </div>
      <p className="mb-8 text-text-secondary">{t("intro")}</p>

      {entries.length === 0 ? (
        <p className="font-mono text-text-secondary">{t("emptyState")}</p>
      ) : (
        <ol className="divide-y divide-border-color border-y border-border-color">
          {entries.map((entry) => (
            <LogEntry key={entryKey(entry)} entry={entry} locale={locale} essayLabel={t("essay")} />
          ))}
        </ol>
      )}
    </div>
  );
}
