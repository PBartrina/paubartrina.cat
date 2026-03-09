import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ara",
  description: "Què faig ara - la meva pàgina ara",
};

export default function AraPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 font-mono text-4xl font-bold text-text-primary">
        Què faig ara
      </h1>
      <p className="mb-8 font-mono text-sm text-text-secondary">
        Última actualització: Abril 2025
      </p>

      <div className="space-y-8 font-mono text-text-primary">
        <p>
          Visc a <strong>Sant Pere de Vilamajor</strong>, a la part baixa del{" "}
          <strong>Montseny</strong>.
        </p>
        <p>
          Sóc <code className="text-text-accent">programador web front-end</code>{" "}
          i actualment cerco feina.
        </p>

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            Les meves prioritats i el estat de projectes
          </h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            <p>
              Per capricis personals i decisions &quot;estratègiques&quot; l&apos;empresa on
              treballava s&apos;ha dissolt i em quedo a l&apos;atur, això sí, només tinc
              agraïments cap a l&apos;empresa on he estat aquests gairebé 8 anys.
            </p>
            <p>
              Tocarà arrencar amb força la web amb{" "}
              <strong>Nuxt</strong> que tenia en stand-by.
            </p>
            <p>
              A l&apos;<strong>Sven</strong> 🐶 li hem fet una neteja dental i li han
              tret un queixal (seny no n&apos;ha tingut mai).
            </p>
            <p>
              Hem tingut una mica de drama amb unes filtracions aquest mes de
              pluges, però ja està tot controlat.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Què m&apos;engresca</h2>
          <div className="space-y-3 pl-4 text-sm leading-relaxed">
            <p>
              Ja estic a la recta final del llibre que vaig començar! M&apos;està
              agradant i segurament continuaré amb la saga del{" "}
              <strong>Arxiu de les Tempestes</strong>.
            </p>
            <p>
              Els bonsais 🌿 estàn començant a brotar amb força, ara ve una
              època bonica de <strong>poda, transplantaments i formació</strong>.
            </p>
          </div>
        </section>

        <p className="mt-12 text-sm italic text-text-secondary">
          Aquesta és la meva pàgina &quot;ara&quot; inspirada en el moviment{" "}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-accent hover:underline"
          >
            now page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
