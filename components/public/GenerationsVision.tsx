import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsVisionProps {
  titleWhite1: string;
  titleCoral1: string;
  titleWhite2: string;
  titleCoral2: string;
  text: string;
  closing: string;
}

export function GenerationsVision({
  titleWhite1,
  titleCoral1,
  titleWhite2,
  titleCoral2,
  text,
  closing,
}: GenerationsVisionProps) {
  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center sm:gap-16">
          <Reveal>
            <h2
              className={cn(
                anton.className,
                "text-balance text-4xl uppercase leading-[0.94] text-white sm:text-6xl"
              )}
            >
              {titleWhite1}
              <br />
              <span style={{ color: ABOUT_COLORS.coral }}>{titleCoral1}</span>
              <br />
              {titleWhite2}
              <br />
              <span style={{ color: ABOUT_COLORS.coral }}>{titleCoral2}</span>
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <p className={cn(hind.className, "max-w-md text-lg leading-relaxed text-white/70")}>{text}</p>
            <div className="mt-7 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-12" style={{ backgroundColor: ABOUT_COLORS.coral }} />
              <p className={cn(anton.className, "text-xl uppercase text-white sm:text-2xl")}>{closing}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
