import { getTranslations } from "next-intl/server";

interface Project {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
  highlight?: boolean;
}

export default async function Projects() {
  const t = await getTranslations("projects");
  const projects = t.raw("items") as Project[];

  return (
    <section id="projects" className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.title}
              className={`relative rounded-lg border bg-card-bg p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                project.highlight
                  ? "border-text-accent border-2"
                  : "border-card-border"
              }`}
            >
              {project.highlight && (
                <span className="absolute -top-3 right-4 rounded-full bg-text-accent px-3 py-1 font-mono text-xs text-bg-primary">
                  {t("featured")}
                </span>
              )}
              <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-20">
                {"</>"}              </span>
              <h3 className="mb-2 font-display text-xl font-bold text-text-primary">
                {project.title}
              </h3>
              <p className="mb-4 font-mono text-sm leading-relaxed text-text-secondary">
                {project.description}
              </p>
              
              {/* Tech stack badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-card-border bg-bg-primary px-2 py-1 font-mono text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Links */}
              <div className="flex gap-3">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-text-accent transition-colors hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    {t("liveLink")}
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-text-accent transition-colors hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    {t("repoLink")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
