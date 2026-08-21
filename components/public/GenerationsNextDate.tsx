import { Eyebrow } from "@/components/public/cartel";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { dayNameFromDate, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GenerationsNextDateProps {
  eyebrow: string;
  nextDate: string | null;
  note: string;
}

/**
 * Sin fecha real todavía → estado neutro ("muy pronto"), nunca una fecha
 * inventada. En cuanto el admin guarda una fecha en /admin/generaciones,
 * se muestra el día/fecha real en grande — mismo criterio de encabezados
 * grandes derivados de la fecha (no del texto libre) que ya usa Oraciones.
 */
export function GenerationsNextDate({ eyebrow, nextDate, note }: GenerationsNextDateProps) {
  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 text-center sm:py-24">
      <Container>
        <Reveal>
          <Eyebrow color={ABOUT_COLORS.coral}>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={120} className="mx-auto mt-7 max-w-lg border border-white/12 px-8 py-10 sm:px-12 sm:py-14">
          {nextDate ? (
            <>
              <p className={cn(anton.className, "text-sm uppercase tracking-widest text-white/50")}>
                {dayNameFromDate(nextDate)}
              </p>
              <p className={cn(anton.className, "mt-2 text-2xl uppercase leading-[1.05] sm:text-4xl")} style={{ color: ABOUT_COLORS.coral }}>
                {formatDate(nextDate)}
              </p>
            </>
          ) : (
            <p className={cn(anton.className, "text-2xl uppercase leading-[1.05] text-white sm:text-4xl")}>
              Próxima fecha <span style={{ color: ABOUT_COLORS.coral }}>muy pronto</span>
            </p>
          )}
          {note && <p className={cn(hind.className, "mt-3.5 text-sm text-white/50")}>{note}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
