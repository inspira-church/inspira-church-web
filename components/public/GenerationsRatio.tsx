"use client";

import { useScrollReveal } from "@/components/public/useScrollReveal";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function GenerationsRatio() {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>(0.4);

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 text-center sm:py-24">
      <Container>
        <div ref={ref} className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2">
          <div>
            <p className={cn(anton.className, "text-[5rem] leading-[0.85] text-white sm:text-8xl")}>
              70<span className="text-[0.4em] align-top">%</span>
            </p>
            <p className={cn(anton.className, "mt-1 text-lg uppercase text-white sm:text-xl")}>Tu equipo base</p>
            <p className={cn(hind.className, "mx-auto mt-2.5 max-w-[34ch] text-sm text-white/70")}>
              La mayor parte del tiempo, cada niño sirve y crece dentro de su área principal.
            </p>
          </div>
          <div>
            <p className={cn(anton.className, "text-[5rem] leading-[0.85] sm:text-8xl")} style={{ color: ABOUT_COLORS.coral }}>
              30<span className="text-[0.4em] align-top">%</span>
            </p>
            <p className={cn(anton.className, "mt-1 text-lg uppercase text-white sm:text-xl")}>Servicio compartido</p>
            <p className={cn(hind.className, "mx-auto mt-2.5 max-w-[34ch] text-sm text-white/70")}>
              Algunos domingos sirve en otras áreas — mantiene una actitud humilde y descubre
              nuevas capacidades.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 flex h-1.5 max-w-xl overflow-hidden bg-white/10 sm:mt-16">
          <div
            className="h-full bg-white transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
            style={{ width: revealed ? "70%" : "0%" }}
          />
          <div
            className="h-full transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
            style={{ width: revealed ? "30%" : "0%", backgroundColor: ABOUT_COLORS.coral }}
          />
        </div>

        <Reveal className="mt-14 sm:mt-20" delay={200}>
          <p className={cn(anton.className, "text-3xl uppercase leading-[1.05] text-white sm:text-5xl")}>
            <span className="text-white/30">Sin estrellas.</span>
            <br />
            Solo siervos.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
