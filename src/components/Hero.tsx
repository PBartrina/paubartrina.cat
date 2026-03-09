export default function Hero() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-bg-primary">
      {/* Decorative code brackets */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        <svg
          viewBox="0 0 400 400"
          className="h-[500px] w-[500px] text-text-secondary"
          fill="currentColor"
        >
          <text x="80" y="180" fontSize="200" fontFamily="monospace">&lt;</text>
          <text x="200" y="350" fontSize="200" fontFamily="monospace">/&gt;</text>
        </svg>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="typing-cursor font-display text-5xl font-bold text-text-primary md:text-7xl">
          Benvinguts
        </h1>
        <p className="mt-6 font-mono text-lg text-text-secondary md:text-xl">
          Desenvolupador web especialitzat en crear solucions
          <br />
          digitals innovadores
        </p>
      </div>
    </section>
  );
}
