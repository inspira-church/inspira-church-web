import Image from "next/image";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/** Resalta en coral la primera aparición de "familia" (palabra completa, sin distinguir mayúsculas) — el resto del título queda igual. */
function highlightFamilia(title: string): ReactNode {
  const match = title.match(/familia/i);
  if (!match || match.index === undefined) return title;
  const start = match.index;
  const end = start + match[0].length;
  return (
    <>
      {title.slice(0, start)}
      <span style={{ color: ABOUT_COLORS.coral }}>{title.slice(start, end)}</span>
      {title.slice(end)}
    </>
  );
}

interface AboutHeroProps {
  eyebrow: string;
  title: string;
  text: string;
  photoUrl: string | null;
  photoAlt: string;
}

export function AboutHero({ eyebrow, title, text, photoUrl, photoAlt }: AboutHeroProps) {
  return (
    <section className="border-b border-white/10 bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className={cn("grid gap-12", photoUrl && "lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16")}>
          <div className={cn(!photoUrl && "mx-auto max-w-2xl text-center")}>
            <Eyebrow color={ABOUT_COLORS.coral}>{eyebrow}</Eyebrow>
            <h1
              className={cn(
                anton.className,
                "mt-5 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl"
              )}
            >
              {highlightFamilia(title)}
            </h1>
            <p className={cn(hind.className, "mt-6 max-w-xl text-lg leading-relaxed text-white/70", !photoUrl && "mx-auto")}>
              {text}
            </p>
          </div>

          {photoUrl && (
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -left-4 -top-4 h-20 w-20 sm:h-28 sm:w-28"
                style={{ backgroundColor: ABOUT_COLORS.teal }}
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 lg:translate-x-4">
                <Image
                  src={photoUrl}
                  alt={photoAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 45vw, 90vw"
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
