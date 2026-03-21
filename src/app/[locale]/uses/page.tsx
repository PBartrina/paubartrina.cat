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

const richComponents = {
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
  code: (chunks: ReactNode) => <code className="rounded bg-card-bg px-1.5 py-0.5 font-mono text-sm">{chunks}</code>,
  link: (chunks: ReactNode) => (
    <a
      href="https://uses.tech"
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-accent hover:underline"
    >
      {chunks}
    </a>
  ),
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "uses" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function UsesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "uses" });
  
  const editorItems = t.raw("editor.items") as string[];
  const terminalItems = t.raw("terminal.items") as string[];
  const browserItems = t.raw("browser.items") as string[];
  const hardwareItems = t.raw("hardware.items") as string[];
  const desktopItems = t.raw("desktop.items") as string[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-mono text-4xl font-bold text-text-primary">
        {t("heading")}
      </h1>
      <p className="mb-8 font-mono text-sm text-text-secondary">
        {t("subtitle")}
      </p>

      <div className="space-y-10 font-mono text-text-primary">
        {/* Editor Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-text-accent">{'{ }'}</span>
            {t("editor.heading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {editorItems.map((item, i) => (
              <p key={i} className="text-text-secondary before:mr-2 before:text-text-accent before:content-['→']">
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Terminal Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-text-accent">{'>'}</span>
            {t("terminal.heading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {terminalItems.map((item, i) => (
              <p key={i} className="text-text-secondary before:mr-2 before:text-text-accent before:content-['→']">
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Browser Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-text-accent">{'<>'}</span>
            {t("browser.heading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {browserItems.map((item, i) => (
              <p key={i} className="text-text-secondary before:mr-2 before:text-text-accent before:content-['→']">
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Hardware Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-text-accent">{'#'}</span>
            {t("hardware.heading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {hardwareItems.map((item, i) => (
              <p key={i} className="text-text-secondary before:mr-2 before:text-text-accent before:content-['→']">
                {item}
              </p>
            ))}
          </div>
        </section>

        {/* Desktop Apps Section */}
        <section>
          <h2 className="mb-4 text-2xl font-bold flex items-center gap-2">
            <span className="text-text-accent">{'[]'}</span>
            {t("desktop.heading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {desktopItems.map((item, i) => (
              <p key={i} className="text-text-secondary before:mr-2 before:text-text-accent before:content-['→']">
                {item}
              </p>
            ))}
          </div>
        </section>

        <p className="mt-12 text-sm italic text-text-secondary">
          {t.rich("footer", richComponents)}
        </p>
      </div>
    </div>
  );
}
