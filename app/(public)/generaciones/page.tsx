import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, GoldButton } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Generaciones | Inspira Church",
  description:
    "Cada generación tiene un lugar en Inspira Church: niños, jóvenes, adultos y adulto mayor. Muy pronto, toda la información aquí.",
};

const GENERATIONS = [
  { name: "Niños", color: ABOUT_COLORS.orange },
  { name: "Jóvenes", color: ABOUT_COLORS.tealLight },
  { name: "Adultos", color: ABOUT_COLORS.green },
  { name: "Adulto mayor", color: ABOUT_COLORS.red },
];

export default function GenerationsPage() {
  return (
    <>
      <section className="border-b border-white/10 bg-black pb-16 pt-16 sm:pb-20 sm:pt-24">
        <Container>
          <Eyebrow color={ABOUT_COLORS.coral}>Un pilar de Inspira Church</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 max-w-2xl text-balance text-5xl uppercase leading-[0.92] text-white sm:text-6xl"
            )}
          >
            Generaciones
          </h1>
          <p className={cn(hind.className, "mt-5 max-w-xl text-lg text-white/70")}>
            En Inspira Church cada etapa de la vida tiene un lugar donde crecer en fe y en
            comunidad — desde los más pequeños hasta quienes ya recorrieron un largo camino.
          </p>
        </Container>
      </section>

      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <p
            className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: ABOUT_COLORS.tealLight, color: ABOUT_COLORS.tealLight }}
          >
            Muy pronto
          </p>
          <h2
            className={cn(
              anton.className,
              "mt-4 max-w-2xl text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
            )}
          >
            Estamos preparando esta sección.
          </h2>
          <p className={cn(hind.className, "mt-4 max-w-xl text-base leading-relaxed text-white/60")}>
            Cada generación va a tener su propio espacio: líderes, horarios y actividades
            pensadas para esa etapa de la vida. Mientras tanto, aquí un vistazo de lo que viene.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GENERATIONS.map((g) => (
              <div
                key={g.name}
                className="border border-white/10 px-6 py-8 transition-colors duration-300"
                style={{ backgroundColor: `${g.color}26` }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: g.color }}
                >
                  Próximamente
                </p>
                <p className={cn(anton.className, "mt-2 text-2xl uppercase leading-none text-white")}>
                  {g.name}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 text-center sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
        <Container>
          <p className="text-xs font-bold uppercase tracking-widest text-black/60">
            ¿Tienes preguntas?
          </p>
          <h2
            className={cn(
              anton.className,
              "mx-auto mt-3 max-w-lg text-balance text-3xl uppercase leading-[0.95] text-black sm:text-4xl"
            )}
          >
            Escríbenos y te contamos más sobre Generaciones.
          </h2>
          <div className="mt-8 flex justify-center">
            <GoldButton href="/contacto" color={ABOUT_COLORS.coral}>
              Contáctanos
            </GoldButton>
          </div>
          <p className="mt-6 text-sm text-black/60">
            <Link href="/" className="font-bold uppercase tracking-wide underline hover:no-underline">
              Volver a Inicio
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
