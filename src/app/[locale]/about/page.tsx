import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";

const BASE_URL = "https://paubartrina.cat";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface Job {
  period: string;
  role: string;
  company: string;
  location?: string;
}

interface Testimonial {
  quote: string;
  author: string;
  company?: string;
  relationship?: string;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const canonicalUrl = `${BASE_URL}/${locale}/about`;
  return {
    title: t("heading"),
    description: t("description"),
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}/about`])),
    },
    openGraph: { title: t("heading"), description: t("description"), url: canonicalUrl, type: "profile" },
  };
}

/**
 * /about absorbs the CV: bio, a compact timeline (period · role · company,
 * descriptions stay in the JSON for the printable /cv) and two testimonials.
 */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });
  const tExp = await getTranslations({ locale, namespace: "experience" });
  const tTest = await getTranslations({ locale, namespace: "testimonials" });
  const jobs = tExp.raw("jobs") as Job[];
  const testimonials = (tTest.raw("items") as Testimonial[]).slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 font-display text-4xl font-bold text-text-primary md:text-5xl">
        {t("heading")}
      </h1>
      <p className="text-lg leading-relaxed text-text-primary">{t("bio")}</p>

      <section className="mt-12 border-t border-border-color pt-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-text-primary">{tExp("heading")}</h2>
        <ol className="divide-y divide-border-color border-y border-border-color">
          {jobs.map((job) => (
            <li key={`${job.company}-${job.period}`} className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
              <span className="font-mono text-xs text-text-secondary">{job.period}</span>
              <div>
                <span className="font-semibold text-text-primary">{job.role}</span>
                <span className="text-text-secondary"> · {job.company}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 font-mono text-xs text-text-secondary">
          <Link href="/cv" className="underline hover:no-underline">
            {t("cvLink")}
          </Link>
        </p>
      </section>

      <section className="mt-12 border-t border-border-color pt-8">
        <h2 className="mb-6 font-display text-2xl font-bold text-text-primary">{tTest("heading")}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.author}>
              <blockquote className="font-display text-lg leading-snug text-text-primary">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-3 font-mono text-xs text-text-secondary">
                {item.author}
                {item.company && `, ${item.company}`}
                {item.relationship && ` · ${item.relationship}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
