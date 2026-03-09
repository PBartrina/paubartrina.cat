const jobs = [
  {
    period: "2025 – 2026",
    role: "Senior R&D Engineer",
    company: "Ansys Iberia",
    location: "Madrid",
    description:
      "Lideratge del frontend per al llançament d'un nou producte estratègic. SME d'Angular, millorant les mètriques de rendiment en un 15%. Testing amb Vitest i Playwright.",
  },
  {
    period: "2017 – 2025",
    role: "Senior Front-end Architect & Developer",
    company: "Byte Default",
    location: "Barcelona",
    description:
      "Arquitectura web escalable amb Angular, Nx i NgRx. Codisseny d'un sistema de formularis dinàmics d'alt rendiment. Testing amb Jest i Cypress.",
  },
  {
    period: "2015 – 2017",
    role: "Fullstack Developer Analyst",
    company: "GFT Group",
    location: "Sant Cugat del Vallès",
    description:
      "Prototipatge i avaluació de frameworks frontend (Angular 2, NativeScript, React Native, Ionic 2) per a aplicacions empresarials. PoCs presentades en conferències FinTech.",
  },
  {
    period: "2013 – 2015",
    role: "Front-End Developer",
    company: "Salemware / 12co",
    location: "Barcelona",
    description:
      "Desenvolupament de frontends segurs i eficients amb JavaScript, HTML5 i CSS3, amb focus en aplicacions sensibles a l'encriptació.",
  },
  {
    period: "2008",
    role: "Cofundador i Front-End Developer",
    company: "Birium",
    location: "Barcelona",
    description:
      "Cofundació d'una startup de plataforma digital. Desenvolupament del frontend i col·laboració en el disseny UI/UX i la planificació estratègica.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          Experiència
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
              <div className={`pb-10 ${index === jobs.length - 1 ? "pb-0" : ""}`}>
                <span className="font-mono text-sm text-text-accent">
                  {job.period}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
                  {job.role}
                </h3>
                <p className="font-mono text-sm text-text-secondary">
                  {job.company}
                  <span className="mx-2 text-text-accent">·</span>
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
