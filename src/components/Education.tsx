const education = [
  {
    year: "2008",
    title: "Enginyeria Multimèdia",
    institution: "Universitat Ramon Llull",
  },
  {
    year: "2005",
    title: "Enginyeria Superior Informàtica",
    institution: "Universitat Politècnica de Catalunya",
  },
  {
    year: "2003 – 2005",
    title: "Batxillerat Científic-Tècnic",
    institution: "Escola Pia de Sarrià-Calassanç",
  },
];

export default function Education() {
  return (
    <section id="education" className="bg-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          Formació
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {education.map((edu) => (
            <div
              key={edu.year}
              className="relative rounded-lg border border-card-border bg-card-bg p-8 transition-shadow hover:shadow-lg"
            >
              <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-30">
                {"#"}
              </span>
              <span className="font-mono text-sm text-text-accent">
                {edu.year}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold text-text-primary">
                {edu.title}
              </h3>
              <p className="mt-1 font-mono text-sm leading-relaxed text-text-secondary">
                {edu.institution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
