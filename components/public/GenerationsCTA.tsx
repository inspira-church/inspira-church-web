import Link from "next/link";
import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * "Inscríbete en Generaciones" lleva a /contacto por ahora — todavía no
 * existe el flujo de inscripción real (recolecta datos de menores, exige
 * decisiones de seguridad/RLS que quedaron pendientes de aprobación). Así
 * nunca es un enlace muerto: mientras tanto, cualquiera que quiera
 * inscribir a su hijo puede escribir directamente.
 */
export function GenerationsCTA() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GenerationsPhotoSlot label="Foto — Generaciones en servicio" tint={ABOUT_COLORS.coral} />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,.5) 0%, rgba(0,0,0,.35) 40%, #000 100%)" }}
        />
      </div>

      <Container className="relative z-10 py-20 sm:py-28">
        <Reveal className="max-w-2xl">
          <h2 className={cn(anton.className, "text-balance text-5xl uppercase leading-[0.88] text-white sm:text-8xl")}>
            Hay un lugar
            <br />
            para ti.
          </h2>
          <p
            className={cn(anton.className, "mt-4 text-base uppercase tracking-wide sm:text-xl")}
            style={{ color: ABOUT_COLORS.coral }}
          >
            Descubre. Sirve. Crece.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/contacto"
              className="group inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
              style={{ backgroundColor: ABOUT_COLORS.coral }}
            >
              Inscríbete en Generaciones
              <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
            <button
              type="button"
              disabled
              className="cursor-not-allowed border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/45"
            >
              Guía para padres
            </button>
          </div>

          <p className={cn(hind.className, "mt-10 max-w-[48ch] text-white/50")}>
            Porque no solo estamos formando iglesia… estamos formando generaciones para Dios.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
