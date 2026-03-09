const skills = [
  {
    title: "Core Stack",
    items: ["Angular (v2-18+)", "TypeScript", "NgRx", "Nx (Monorepos)"],
    bracket: "{ }",
  },
  {
    title: "Arquitectura",
    items: ["Disseny Modular", "DDD", "Arq. Hexagonal", "Design Systems"],
    bracket: "[ ]",
  },
  {
    title: "Testing",
    items: ["Vitest", "Jest", "Playwright", "Cypress", "Pact"],
    bracket: "( )",
  },
  {
    title: "Mobile",
    items: ["NativeScript", "React Native", "Ionic"],
    bracket: "< >",
  },
  {
    title: "Rendiment i Eines",
    items: ["CI/CD", "Storybook", "Webpack / Vite", "Web Vitals"],
    bracket: "=>",
  },
  {
    title: "Lideratge",
    items: ["Agile / Scrum", "Mentoring", "Equips Multidisciplinars"],
    bracket: "::",
  },
];

export default function Skills() {
  return (
    <section id="skills" className="bg-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          Habilitats Tècniques
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
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
