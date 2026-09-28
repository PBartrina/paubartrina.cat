import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "uses" });

  const ogImageUrl = "https://paubartrina.cat/og-default.png";
  const canonicalUrl = `https://paubartrina.cat/${locale}/uses`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://paubartrina.cat/${l}/uses`])
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
          alt: "Pau Bartrina – Senior Software Engineer",
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

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "uses" });

  // Defined inside the component so it has access to locale and runtime values
  const richComponents = {
    strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
    code: (chunks: ReactNode) => <code className="rounded bg-card-bg px-1.5 py-0.5 font-mono text-sm">{chunks}</code>,
    link: (chunks: ReactNode) => (
      // This link always points to uses.tech (the /uses inspiration directory)
      <a
        href="https://uses.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-accent underline hover:no-underline"
      >
        {chunks}
      </a>
    ),
  };
  
  // One glyph per section, decorative — rendered as ::before content via
  // data-glyph so it is never a text node (see globals.css).
  const sections = [
    ["editor", "{ }"],
    ["terminal", ">_"],
    ["browser", "://"],
    ["hardware", "[ ]"],
    ["desktop", "::"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold text-text-primary md:text-5xl">
        {t("heading")}
      </h1>
      <p className="mb-10 text-lg leading-relaxed text-text-secondary">
        {t("subtitle")}
      </p>

      <div className="divide-y divide-border-color border-y border-border-color text-text-primary">
        {sections.map(([key, glyph]) => (
          <section key={key} className="grid gap-3 py-8 sm:grid-cols-[12rem_1fr] sm:gap-8">
            <h2 className="flex items-baseline gap-3 font-display text-2xl font-bold">
              <span
                aria-hidden="true"
                data-glyph={glyph}
                className="glyph font-mono text-sm text-text-accent"
              />
              {t(`${key}.heading`)}
            </h2>
            <ul className="space-y-2 font-mono text-sm leading-relaxed text-text-secondary">
              {(t.raw(`${key}.items`) as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm italic text-text-secondary">
        {t.rich("footer", richComponents)}
      </p>
    </div>
  );
}
