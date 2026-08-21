import { Eyebrow } from "@/components/public/cartel";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const PRINCIPLES = [
  "Ningún niño queda a solas con un solo adulto.",
  "Siempre existe supervisión responsable en cada actividad.",
  "Los jóvenes que sirven en Kids nunca quedan solos con un grupo de niños.",
  "El contacto digital con menores se realiza siempre a través de sus padres o acudientes.",
  "Cualquier inquietud puede comunicarse de forma confidencial a los pastores.",
  "El bienestar del menor es, ante todo, la prioridad.",
];

export function GenerationsSafety() {
  return (
    <section className="border-b border-white/10 py-16 sm:py-24" style={{ backgroundColor: "#12332e" }}>
      <Container>
        <div className="grid gap-10 sm:grid-cols-[0.85fr_1.15fr] sm:gap-16">
          <Reveal>
            <Eyebrow color={ABOUT_COLORS.tealLight}>Cuidado y seguridad</Eyebrow>
            <h2 className={cn(anton.className, "mt-5 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-5xl")}>
              Crecer en un
              <br />
              lugar seguro.
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <ul className="flex flex-col">
              {PRINCIPLES.map((p) => (
                <li key={p} className="flex gap-3.5 border-t border-white/15 py-4 text-white/75 last:border-b">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0"
                    style={{ backgroundColor: ABOUT_COLORS.tealLight }}
                  />
                  <span className={hind.className}>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <button
                type="button"
                disabled
                className="cursor-not-allowed border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/45"
              >
                Conoce los lineamientos de cuidado
              </button>
              <p className="mt-2.5 text-xs text-white/40">
                Se activa en cuanto exista el documento real — nunca apunta a un lugar vacío.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
