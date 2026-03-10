import { useTranslations } from "next-intl";

export default function Experience() {
  const t = useTranslations("experience");
  const jobs = t.raw("jobs") as Array<{
    period: string;
    role: string;
    company: string;
    location: string;
    description: string;
  }>;

  return (
    <section id="experience" className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>

        <div className="space-y-0">
          {jobs.map((job, index) => (
            <div key={job.company} className="relative flex gap-6">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-text-accent bg-bg-secondary" />
                {index < jobs.length - 1 && (
                  <div className="w-0.5 flex-1 bg-card-border" />
                )}
              </div>

              {/* Content */}
              <div
                className={`pb-10 ${index === jobs.length - 1 ? "pb-0" : ""}`}
              >
                <span className="font-mono text-sm text-text-accent">
                  {job.period}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
                  {job.role}
                </h3>
                <p className="font-mono text-sm text-text-secondary">
                  {job.company}
                  <span className="mx-2 text-text-accent">&middot;</span>
                  {job.location}
                </p>
                <p className="mt-2 font-mono text-sm leading-relaxed text-text-secondary">
                  {job.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
