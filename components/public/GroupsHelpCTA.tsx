import { GoldButton } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Siempre visible después del catálogo — con resultados o sin ellos (brief §19). */
export function GroupsHelpCTA() {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
      <Container className="text-center">
        <p className="inline-block border border-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/70">
          ¿No encontraste uno cerca?
        </p>
        <h2
          className={cn(
            anton.className,
            "mx-auto mt-4 max-w-xl text-balance text-3xl uppercase leading-[0.95] text-black sm:text-4xl"
          )}
        >
          Queremos ayudarte a encontrar tu lugar.
        </h2>
        <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-base text-black/70")}>
          Cuéntanos dónde estás y te ayudaremos a encontrar el grupo que mejor se adapte a ti.
        </p>
        <div className="mt-8 flex justify-center">
          <GoldButton href="/grupos/unirme" color={ABOUT_COLORS.coral}>
            Quiero que me contacten
          </GoldButton>
        </div>
      </Container>
    </section>
  );
}
