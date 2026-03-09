import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacte",
  description:
    "Tens alguna pregunta o proposta? Envia'm un missatge directament des d'aquí.",
};

export default function ContactePage() {
  return (
    <section className="bg-bg-secondary py-20">
      <div className="mx-auto max-w-2xl px-6">
        <div className="relative rounded-lg border border-card-border bg-card-bg p-8 md:p-12">
          {/* Decorative bracket */}
          <span className="absolute right-6 top-6 select-none font-mono text-5xl text-text-secondary opacity-20">
            @
          </span>

          <h1 className="mb-2 font-display text-3xl font-bold text-text-primary">
            Contacte
          </h1>
          <p className="mb-8 font-mono text-sm text-text-secondary">
            Tens alguna pregunta o proposta? Envia&apos;m un missatge!
          </p>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
