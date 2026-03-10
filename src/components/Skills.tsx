import { useTranslations } from "next-intl";

export default function Skills() {
  const t = useTranslations("skills");
  const categories = t.raw("categories") as Array<{
    title: string;
    items: string[];
    bracket: string;
  }>;

  return (
    <section id="skills" className="bg-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((skill) => (
            <div
              key={skill.title}
              className="relative rounded-lg border border-card-border bg-card-bg p-8 transition-shadow hover:shadow-lg"
            >
              <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-30">
                {skill.bracket}
              </span>
              <h3 className="mb-4 font-mono text-xl font-bold text-text-primary">
                {skill.title}
              </h3>
              <ul className="space-y-1.5">
                {skill.items.map((item) => (
                  <li
                    key={item}
                    className="font-mono text-sm text-text-secondary before:mr-2 before:text-text-accent before:content-['→']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
