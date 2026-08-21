"use client";

import { useScrollReveal } from "@/components/public/useScrollReveal";
import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function GenerationsAltar() {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>(0.3);

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden border-b border-white/10">
      <div ref={ref} className="absolute inset-0 z-0">
        <div
          className={cn(
            "absolute -inset-[4%] transition-transform duration-[1200ms] ease-out motion-reduce:transition-none",
            revealed ? "scale-100" : "scale-110"
          )}
        >
          <GenerationsPhotoSlot label="Foto — un joven sirviendo" tint={ABOUT_COLORS.tealLight} />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.75) 100%)" }}
        />
      </div>

      <Container className="relative z-10 py-20 sm:py-28">
        <div className="max-w-2xl">
          <h2 className={cn(anton.className, "text-balance text-4xl uppercase leading-[0.92] text-white sm:text-7xl")}>
            Toda área
            <br />
            es altar.
          </h2>
          <p className={cn(hind.className, "mt-6 max-w-[52ch] text-lg text-white/70 sm:text-xl")}>
            No importa si alguien canta, recibe a los visitantes, sirve en cafetería, apoya en
            logística o trabaja detrás de una cámara. Cada lugar de servicio tiene valor.
          </p>
          <p
            className="mt-5 text-sm font-bold uppercase tracking-wide sm:text-base"
            style={{ color: ABOUT_COLORS.coral }}
          >
            Aquí no formamos figuras. Formamos corazones dispuestos a servir.
          </p>
        </div>
      </Container>
    </section>
  );
}
