const services = [
  {
    title: "Desenvolupament Web",
    description:
      "Creació de llocs web moderns i responsius amb les últimes tecnologies.",
  },
  {
    title: "Disseny UX/UI",
    description:
      "Dissenys intuïtius i atractius centrats en l'experiència d'usuari.",
  },
  {
    title: "Optimització Web",
    description:
      "Millora del rendiment i posicionament SEO del teu lloc web.",
  },
];

export default function Services() {
  return (
    <section id="features" className="bg-bg-primary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-mono text-3xl font-bold text-text-primary">
          Els Meus Serveis
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="relative rounded-lg border border-card-border bg-card-bg p-8 transition-shadow hover:shadow-lg"
            >
              {/* Decorative curly braces */}
              <span className="absolute right-4 top-4 font-mono text-2xl text-text-secondary opacity-30">
                {"{ }"}
              </span>
              <h3 className="mb-3 font-mono text-xl font-bold text-text-primary">
                {service.title}
              </h3>
              <p className="font-mono text-sm leading-relaxed text-text-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
