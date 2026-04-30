import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/config";
import PrintButton from "@/components/PrintButton";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cv" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false },
  };
}

interface Job {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
}

interface EducationEntry {
  year: string;
  title: string;
  institution: string;
}

interface SkillCategory {
  title: string;
  items: string[];
}

interface Language {
  label: string;
  level: string;
}

export default async function CVPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "cv" });
  const tExp = await getTranslations({ locale, namespace: "experience" });
  const tEdu = await getTranslations({ locale, namespace: "education" });
  const tSkills = await getTranslations({ locale, namespace: "skills" });
  const tAbout = await getTranslations({ locale, namespace: "about" });

  const jobs = tExp.raw("jobs") as Job[];
  const entries = tEdu.raw("entries") as EducationEntry[];
  const categories = tSkills.raw("categories") as SkillCategory[];
  const languages = tAbout.raw("languages") as Language[];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 print:px-0 print:py-0">
      {/* Screen-only toolbar */}
      <div className="print:hidden mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-text-accent hover:underline"
        >
          ← {t("backHome")}
        </Link>
        <PrintButton label={t("printButton")} />
      </div>

      {/* CV Header */}
      <header className="mb-8 border-b border-border-color pb-6">
        <h1 className="font-display text-4xl font-bold text-text-primary">
          Pau Bartrina
        </h1>
        <p className="mt-1 font-mono text-lg text-text-accent">
          Senior Frontend Engineer
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm text-text-secondary">
          <a href="https://paubartrina.cat" className="hover:underline print:no-underline">
            paubartrina.cat
          </a>
          <a href="https://linkedin.com/in/paubartrina" className="hover:underline print:no-underline">
            linkedin.com/in/paubartrina
          </a>
          <a href="https://github.com/PBartrina" className="hover:underline print:no-underline">
            github.com/PBartrina
          </a>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <p className="font-mono text-sm leading-relaxed text-text-secondary">
          {tAbout("bio")}
        </p>
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          {tSkills("heading")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.title}>
              <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-wide text-text-accent">
                {cat.title}
              </p>
              <p className="font-mono text-xs text-text-secondary">
                {cat.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          {tExp("heading")}
        </h2>
        <ol className="space-y-5">
          {jobs.map((job) => (
            <li key={`${job.period}-${job.company}`} className="print:break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="font-display font-semibold text-text-primary">
                    {job.role}
                  </span>
                  <span className="mx-2 text-text-secondary">·</span>
                  <span className="font-mono text-sm text-text-secondary">
                    {job.company}
                  </span>
                  <span className="mx-2 text-text-secondary">·</span>
                  <span className="font-mono text-sm text-text-secondary">
                    {job.location}
                  </span>
                </div>
                <span className="font-mono text-xs text-text-secondary">
                  {job.period}
                </span>
              </div>
              <p className="mt-1 font-mono text-sm leading-relaxed text-text-secondary">
                {job.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          {tEdu("heading")}
        </h2>
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li key={`${entry.year}-${entry.title}`} className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-display font-semibold text-text-primary">
                  {entry.title}
                </span>
                <span className="mx-2 text-text-secondary">·</span>
                <span className="font-mono text-sm text-text-secondary">
                  {entry.institution}
                </span>
              </div>
              <span className="font-mono text-xs text-text-secondary">
                {entry.year}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Languages */}
      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-text-primary">
          {tAbout("languagesLabel")}
        </h2>
        <ul className="flex flex-wrap gap-4">
          {languages.map((lang) => (
            <li key={lang.label} className="font-mono text-sm">
              <span className="text-text-primary">{lang.label}</span>
              <span className="mx-1.5 text-text-secondary">·</span>
              <span className="text-text-secondary">{lang.level}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
