import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import LogEntry, { entryKey } from "@/components/LogEntry";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Link } from "@/i18n/navigation";
import { getLogEntries } from "@/lib/log";
import { safeJsonLd } from "@/lib/utils";
import { locales } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const LATEST = 5;

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });
  const tLog = await getTranslations({ locale, namespace: "log" });
  const latest = (await getLogEntries(locale)).slice(0, LATEST);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Pau Bartrina",
    jobTitle: "Senior Software Engineer",
    url: `https://paubartrina.cat/${locale}`,
    sameAs: [
      "https://bsky.app/profile/paubartrina.cat",
      "https://linkedin.com/in/paubartrina",
      "https://github.com/PBartrina",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(personJsonLd) }}
      />
      <Hero />
      <RevealOnScroll>
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {t("latestHeading")}
            </h2>
            <Link href="/log" className="font-mono text-sm text-text-accent underline hover:no-underline">
              {t("allLog")}
            </Link>
          </div>
          <ol className="divide-y divide-border-color border-y border-border-color">
            {latest.map((entry) => (
              <LogEntry
                key={entryKey(entry)}
                entry={entry}
                locale={locale}
                essayLabel={tLog("essay")}
                headingLevel="h3"
              />
            ))}
          </ol>
        </section>
      </RevealOnScroll>
    </>
  );
}
