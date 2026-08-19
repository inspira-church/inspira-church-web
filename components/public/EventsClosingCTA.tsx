import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Cierre de /eventos — puramente visual a propósito: el brief solo pide el
 * CTA "Ver todo lo que viene" cuando hay volumen/paginación que lo
 * justifique, y hoy no lo hay (un evento real). Sin botón inventado.
 */
export function EventsClosingCTA() {
  return (
    <section className="py-16 text-center sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
      <Container>
        <p className="text-xs font-bold uppercase tracking-widest text-black/60">Hay más por vivir</p>
        <p
          className={cn(
            anton.className,
            "mx-auto mt-3 max-w-xl text-balance text-3xl uppercase leading-[1.05] text-black sm:text-5xl"
          )}
        >
          No te quedes por fuera.
        </p>
        <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-base text-black/70")}>
          Siempre hay un próximo encuentro para conectar, crecer y compartir en comunidad.
        </p>
      </Container>
    </section>
  );
}
