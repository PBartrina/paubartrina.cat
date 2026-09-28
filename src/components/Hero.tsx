import { getTranslations } from "next-intl/server";
import GenerativeMark from "@/components/GenerativeMark";

export default async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-bg-primary py-20 md:py-32">
      {/* Generative field — seeded per deploy, see src/lib/mark.ts */}
      <div className="pointer-events-none absolute inset-0 text-text-accent opacity-[0.14]">
        <GenerativeMark cols={28} rows={10} animate className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <h1 className="font-display text-4xl font-bold leading-tight text-text-primary md:text-6xl md:leading-[1.05]">
          {t("headline")}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl">
          {t("line2")}
          <br />
          {t("line3")}
        </p>
      </div>
    </section>
  );
}
