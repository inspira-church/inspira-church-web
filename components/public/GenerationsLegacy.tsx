"use client";

import { useScrollReveal } from "@/components/public/useScrollReveal";
import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsLegacyProps {
  titleWhite: string;
  titleCoral: string;
  photoUrl1?: string | null;
  photoUrl2?: string | null;
}

export function GenerationsLegacy({ titleWhite, titleCoral, photoUrl1, photoUrl2 }: GenerationsLegacyProps) {
  const { ref: lineRef, revealed: lineRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <div className="grid gap-12 sm:grid-cols-[3rem_1fr_1fr] sm:items-center sm:gap-12">
          <div
            ref={lineRef}
            aria-hidden="true"
            className={cn(
              "hidden h-40 w-px origin-top transition-transform duration-[1100ms] ease-out motion-reduce:transition-none sm:block sm:h-56",
              lineRevealed ? "scale-y-100" : "scale-y-0"
            )}
            style={{ backgroundColor: ABOUT_COLORS.tealLight }}
          />

          <Reveal>
            <h2 className={cn(anton.className, "text-balance text-4xl uppercase leading-[0.95] text-white sm:text-6xl whitespace-pre-line")}>
              {titleWhite}
              <span className="mt-3 block sm:mt-4" style={{ color: ABOUT_COLORS.tealLight }}>
                {titleCoral}
              </span>
            </h2>
          </Reveal>

          <Reveal delay={150} className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden">
              <GenerationsPhotoSlot photoUrl={photoUrl1} label="Foto — acompañamiento" tint={ABOUT_COLORS.tealLight} />
            </div>
            <div className="relative mt-9 aspect-[3/4] overflow-hidden">
              <GenerationsPhotoSlot photoUrl={photoUrl2} label="Foto — sirviendo juntos" tint={ABOUT_COLORS.cream} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
