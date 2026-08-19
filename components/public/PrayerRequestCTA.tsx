import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Cierre de /oraciones — enlaza al formulario de petición ya existente (/oracion, PrayerRequestForm) en vez de duplicarlo. */
export function PrayerRequestCTA() {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="inline-block border border-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/70">
            Estamos contigo
          </p>
          <h2
            className={cn(
              anton.className,
              "mt-4 text-balance text-3xl uppercase leading-[1.05] text-black sm:text-5xl"
            )}
          >
            ¿Podemos orar por ti?
          </h2>
          <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-base text-black/70")}>
            Cuéntanos por qué podemos acompañarte en oración. Cada petición es recibida con amor y
            llevada delante de Dios.
          </p>
          <Link
            href="/oracion"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:brightness-110"
          >
            Compartir mi petición
            <span aria-hidden="true">→</span>
          </Link>
          <p className="mt-5 text-sm font-semibold text-black/80">
            Ninguna petición pasa desapercibida.
          </p>
          <p className="mt-1.5 text-xs text-black/60">
            Tu petición será tratada con respeto y confidencialidad.
          </p>
        </div>
      </Container>
    </section>
  );
}
