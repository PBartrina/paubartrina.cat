import { localeOgImage } from "@/lib/og";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/config";
import ContactForm from "./ContactForm";
import CopyEmail from "@/components/CopyEmail";

const BASE_URL = "https://paubartrina.cat";
interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const canonicalUrl = `${BASE_URL}/${locale}/contacte`;

  return {
    title: t("heading"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/contacte`])
      ),
    },
    openGraph: {
      ...localeOgImage(locale),
      title: t("heading"),
      description: t("description"),
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("heading"),
      description: t("description"),
    },
  };
}

export default async function ContactePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-display text-4xl font-bold text-text-primary md:text-5xl">
        {t("heading")}
      </h1>
      <p className="mb-10 text-lg leading-relaxed text-text-secondary">{t("subtitle")}</p>

      <div className="max-w-xl border-t border-border-color pt-8">
        <ContactForm />
        <CopyEmail />
      </div>
    </div>
  );
}
