import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("about");
  const languages = t.raw("languages") as Array<{
    label: string;
    level: string;
  }>;

  return (
    <section id="about" className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>

        <div className="relative rounded-lg border border-card-border bg-card-bg p-8 md:p-12">
          <span className="absolute right-6 top-6 font-mono text-2xl text-text-secondary opacity-20">
            {"//"}
          </span>

          <p className="font-mono text-base leading-relaxed text-text-secondary md:text-lg">
            {t("bio")}
          </p>

          <div className="mt-8 border-t border-card-border pt-8">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-text-accent">
              {t("languagesLabel")}
            </p>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <span
                  key={lang.label}
                  className="rounded-md border border-card-border bg-bg-primary px-4 py-2 font-mono text-sm text-text-secondary"
                >
                  <span className="text-text-primary">{lang.label}</span>
                  <span className="ml-2 text-text-accent">{lang.level}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
