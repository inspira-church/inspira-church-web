import { Eyebrow } from "@/components/public/cartel";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Todavía no hay una próxima fecha real publicada — se muestra un estado
 * neutro en vez de inventar un día. Cuando exista un campo administrable
 * para esto (ver pendientes), este componente pasa a recibir esa fecha
 * como prop y renderiza el día/mes/hora en grande.
 */
export function GenerationsNextDate() {
  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 text-center sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow color={ABOUT_COLORS.coral}>Próximo Generaciones</Eyebrow>
        </Reveal>
        <Reveal delay={120} className="mx-auto mt-7 max-w-lg border border-white/12 px-8 py-10 sm:px-12 sm:py-14">
          <p className={cn(anton.className, "text-2xl uppercase leading-[1.05] text-white sm:text-4xl")}>
            Próxima fecha <span style={{ color: ABOUT_COLORS.coral }}>muy pronto</span>
          </p>
          <p className={cn(hind.className, "mt-3.5 text-sm text-white/50")}>
            Todavía no hay una fecha confirmada — en cuanto el equipo la publique, aparecerá aquí.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
