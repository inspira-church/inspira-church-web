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
            <p className={cn(hind.className, "mt-5 max-w-md text-base leading-relaxed text-black/70")}>
              {visionText}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
