import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "./ContactForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("heading"),
    description: t("description"),
  };
}

export default async function ContactePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <section className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-2xl px-6">
        <div className="relative rounded-lg border border-card-border bg-card-bg p-8 md:p-12">
          {/* Decorative bracket */}
          <span className="absolute right-6 top-6 select-none font-mono text-5xl text-text-secondary opacity-20">
            @
          </span>

          <h1 className="mb-2 font-display text-3xl font-bold text-text-primary">
            {t("heading")}
          </h1>
          <p className="mb-8 font-mono text-sm text-text-secondary">
            {t("subtitle")}
          </p>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
