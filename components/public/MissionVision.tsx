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
              site_settings.about.visionText guarda una idea por línea (editable
              desde /admin/nosotros): cada línea no vacía es un <li>. La viñeta
              es la nativa del navegador (list-disc), coloreada con el acento —
              el color va en el <li> y el texto lo restablece en el <span>.
            */}
            <ul
              className={cn(hind.className, "mt-5 max-w-md list-disc space-y-3 pl-5 text-base leading-relaxed")}
            >
              {visionText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i} className="pl-1" style={{ color: ABOUT_COLORS.orange }}>
                    <span className="text-black/70">{line}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
