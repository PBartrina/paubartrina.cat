import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("hero");
  const techBadges = t.raw("techBadges") as string[];

  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden bg-bg-primary py-16 md:py-24">
      {/* Decorative code brackets */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        <svg
          viewBox="0 0 400 400"
          className="h-[300px] w-[300px] text-text-secondary"
          fill="currentColor"
        >
          <text x="80" y="180" fontSize="200" fontFamily="monospace">
            &lt;
          </text>
          <text x="200" y="350" fontSize="200" fontFamily="monospace">
            /&gt;
          </text>
        </svg>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="typing-cursor font-display text-5xl font-bold text-text-primary md:text-7xl">
          {t("greeting")}
        </h1>
        <p className="mt-6 font-mono text-lg text-text-secondary md:text-xl">
          {t("title")}
          <br />
          {t("subtitle")}
        </p>

        {/* Tech badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {techBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-md border border-card-border bg-card-bg px-3 py-1.5 font-mono text-xs text-text-secondary md:text-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
