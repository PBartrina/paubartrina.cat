import { getTranslations, setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import MarkPlayground from "@/components/MarkPlayground";
import { BUILD_SEED, BUILD_SEED_HREF } from "@/lib/mark";
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
      <section className="border-b border-border-color">
        <div className="mx-auto grid max-w-3xl gap-8 px-6 py-16 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
          <MarkPlayground
            initialSeed={BUILD_SEED}
            seedHref={BUILD_SEED_HREF}
            labels={{ seed: t("markSeed"), regenerate: t("markRegenerate"), reset: t("markReset") }}
          />
          <div>
            <h2 className="mb-4 font-display text-2xl font-bold text-text-primary">{t("markHeading")}</h2>
            <p className="mb-3 leading-relaxed text-text-secondary">{t("markP1")}</p>
            <p className="mb-4 leading-relaxed text-text-secondary">{t("markP2")}</p>
            <Link href="/blog/la-marca" className="font-mono text-sm text-text-accent underline hover:no-underline">
              {t("markMore")}
            </Link>
          </div>
        </div>
      </section>
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
