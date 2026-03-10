import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ara" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AraPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "ara" });
  const priorities = t.raw("priorities") as string[];
  const excitement = t.raw("excitement") as string[];

  // Parse the footer to extract the link
  const footerText = t("footer") as string;
  const footerParts = footerText.split(/<link>|<\/link>/);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-mono text-4xl font-bold text-text-primary">
        {t("heading")}
      </h1>
      <p className="mb-8 font-mono text-sm text-text-secondary">
        {t("lastUpdated")}
      </p>

      <div className="space-y-8 font-mono text-text-primary">
        <p dangerouslySetInnerHTML={{ __html: t("location") }} />
        <p dangerouslySetInnerHTML={{ __html: t("occupation") }} />

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            {t("prioritiesHeading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {priorities.map((text, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            {t("excitementHeading")}
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            {excitement.map((text, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
            ))}
          </div>
        </section>

        <p className="mt-12 text-sm italic text-text-secondary">
          {footerParts[0]}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-accent hover:underline"
          >
            {footerParts[1]}
          </a>
          {footerParts[2]}
        </p>
      </div>
    </div>
  );
}
