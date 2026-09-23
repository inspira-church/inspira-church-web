import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow, GoldButton } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const TITLE = "Manos Vivas | Inspira Church";
const DESCRIPTION = "Conoce próximamente Manos Vivas, un espacio de Inspira Church.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/manos-vivas" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/manos-vivas", type: "website" },
};

export default function ManosVivasPage() {
  return (
    <>
      <section className="border-b border-white/10 bg-black pb-16 pt-16 sm:pb-20 sm:pt-24">
        <Container>
          <Eyebrow color={ABOUT_COLORS.coral}>Manos Vivas</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 max-w-2xl text-balance text-5xl uppercase leading-[0.92] text-white sm:text-6xl"
            )}
          >
            Manos Vivas
          </h1>
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
            Muy pronto
          </h2>
          <p className={cn(hind.className, "mt-4 max-w-xl text-base leading-relaxed text-white/60")}>
            Estamos preparando este espacio para compartir contigo todo lo relacionado con Manos
            Vivas.
          </p>
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
            Escríbenos y te contamos más.
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
