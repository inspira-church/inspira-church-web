import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface MissionVisionProps {
  eyebrow: string;
  title: string;
  missionLabel: string;
  missionHeadline: string;
  missionText: string;
  visionLabel: string;
  visionHeadline: string;
  visionText: string;
}

export function MissionVision({
  eyebrow,
  title,
  missionLabel,
  missionHeadline,
  missionText,
  visionLabel,
  visionHeadline,
  visionText,
}: MissionVisionProps) {
  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: ABOUT_COLORS.cream }}>
      <Container>
        <p className="inline-block border border-black/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-black/70">
          {eyebrow}
        </p>
        <h2
          className={cn(
            anton.className,
            "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-black sm:text-5xl"
          )}
        >
          {title}
        </h2>

        <div className="mt-16 grid gap-14 border-t border-black/15 pt-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              {missionLabel}
            </p>
            <p
              className={cn(
                anton.className,
                "mt-3 text-balance text-3xl uppercase leading-[0.95] text-black sm:text-4xl"
              )}
            >
              {missionHeadline}
            </p>
            <p className={cn(hind.className, "mt-5 max-w-md text-base leading-relaxed text-black/70")}>
              {missionText}
            </p>
          </div>

          <div className="lg:mt-16">
            <p className="text-xs font-bold uppercase tracking-widest text-black/50">
              {visionLabel}
            </p>
            <p
              className={cn(
                anton.className,
                "mt-3 text-balance text-3xl uppercase leading-[0.95] text-black sm:text-4xl"
              )}
            >
              {visionHeadline}
            </p>
            {/*
              El CMS guarda visionText como un solo bloque de texto (una idea
              por línea, separadas por salto de línea — así ya está escrito
              hoy en site_settings.about). En vez de mostrarlo como un
              párrafo corrido, se separa por línea y cada idea se presenta
              como un bloque breve con un acento de color — sin tocar el
              contenido ni el esquema de datos, solo la presentación.
            */}
            <ul className="mt-5 flex max-w-lg flex-col gap-4">
              {visionText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-[3px] w-5 shrink-0"
                      style={{ backgroundColor: ABOUT_COLORS.orange }}
                    />
                    <span className={cn(hind.className, "text-sm leading-relaxed text-black/70")}>
                      {line}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
