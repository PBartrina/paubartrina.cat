import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";
import { getLogEntries, type LogEntry } from "@/lib/log";

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
    openGraph: { title: t("title"), description: t("description"), url: canonicalUrl, type: "website" },
  };
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

function Entry({ entry, locale, essayLabel }: { entry: LogEntry; locale: string; essayLabel: string }) {
  const date = (
    <time dateTime={entry.date} className="font-mono text-xs text-text-secondary">
      {formatDate(entry.date, locale)}
    </time>
  );

  if (entry.kind === "essay") {
    return (
      <li className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
        {date}
        <div>
          <span className="mb-1 inline-block rounded-full border border-text-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-text-accent">
            {essayLabel}
          </span>
          <h2 className="font-display text-2xl font-bold text-text-primary">
            <Link href={entry.href} className="hover:underline">
              {entry.title}
            </Link>
          </h2>
          {entry.description && <p className="mt-1 text-text-secondary">{entry.description}</p>}
        </div>
      </li>
    );
  }

  return (
    <li className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-6">
      {date}
      <div>
        <a
          href={entry.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-text-primary hover:underline"
        >
          {entry.title}
          <span className="ml-2 text-text-secondary">#{entry.number}</span>
        </a>
        {entry.note && <p className="mt-1 text-sm italic text-text-secondary">{entry.note}</p>}
      </div>
    </li>
  );
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
            <Entry
              key={entry.kind === "pr" ? `pr-${entry.number}` : `essay-${entry.href}`}
              entry={entry}
              locale={locale}
              essayLabel={t("essay")}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
