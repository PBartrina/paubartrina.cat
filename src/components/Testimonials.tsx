import { getTranslations } from "next-intl/server";

interface TestimonialItem {
  quote: string;
  author: string;
  company: string;
  relationship: string;
}

export default async function Testimonials() {
  const t = await getTranslations("testimonials");
  const items = t.raw("items") as TestimonialItem[];

  return (
    <section id="testimonials" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center font-display text-3xl font-bold text-text-primary">
          {t("heading")}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, index) => (
            <figure
              key={index}
              className="flex flex-col rounded-lg border border-card-border bg-card-bg p-6"
            >
              {/* Opening quote mark */}
              <span
                aria-hidden="true"
                className="mb-2 font-display text-4xl leading-none text-text-accent opacity-40"
              >
                &ldquo;
              </span>
              <blockquote className="flex-1">
                <p className="font-mono text-sm leading-relaxed text-text-secondary">
                  {item.quote}
                </p>
              </blockquote>
              <figcaption className="mt-6 border-t border-border-color pt-4">
                <p className="font-display text-sm font-semibold text-text-primary">
                  {item.author}
                </p>
                <p className="mt-0.5 font-mono text-xs text-text-secondary">
                  {item.relationship} · {item.company}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
