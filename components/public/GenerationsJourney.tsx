"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: "01", title: "Explora", when: "Primer semestre", text: "Los niños y jóvenes conocen las diferentes áreas y participan en ellas." },
  { num: "02", title: "Descubre", when: "", text: "Identifican afinidades, dones, habilidades y formas de servir." },
  { num: "03", title: "Encuentra tu lugar", when: "", text: "La decisión se acompaña entre el niño o joven, su familia y los líderes." },
  { num: "04", title: "Crece", when: "Segundo semestre", text: "Se conforman equipos base donde cada quien profundiza en su área principal." },
] as const;

/**
 * Línea de progreso que avanza conforme cada etapa entra en viewport — no
 * reutiliza useScrollReveal porque necesita saber CUÁNTAS etapas van
 * activas para calcular el ancho de la línea, no solo un booleano por
 * elemento.
 */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GenerationsJourney() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Lazy initializer (no un setState dentro del efecto): con
  // prefers-reduced-motion arranca ya con todas las etapas activas.
  const [activeCount, setActiveCount] = useState(() => (prefersReducedMotion() ? STEPS.length : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = stepRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1) setActiveCount((c) => Math.max(c, idx + 1));
        });
      },
      { threshold: 0.5 }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <Reveal>
          <h2 className={cn(anton.className, "text-balance text-center text-3xl uppercase leading-[0.95] text-white sm:text-5xl")}>
            Un proceso para descubrir tu lugar
          </h2>
        </Reveal>

        <div className="relative mt-16 sm:mt-24">
          <div className="absolute left-0 top-[7px] hidden h-0.5 w-full bg-white/10 sm:block" aria-hidden="true">
            <div
              className="h-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ backgroundColor: ABOUT_COLORS.coral, width: `${(activeCount / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
            {STEPS.map((step, i) => {
              const active = i < activeCount;
              return (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative pt-9"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-4 w-4 rounded-full border-2 transition-colors duration-500 ease-out motion-reduce:transition-none"
                    style={{
                      backgroundColor: active ? ABOUT_COLORS.coral : "#000",
                      borderColor: active ? ABOUT_COLORS.coral : "rgba(255,255,255,.3)",
                    }}
                  />
                  <p
                    className={cn(anton.className, "text-xs tracking-widest transition-colors duration-500 ease-out motion-reduce:transition-none")}
                    style={{ color: active ? ABOUT_COLORS.coral : "rgba(255,255,255,.3)" }}
                  >
                    {step.num}
                  </p>
                  <p className={cn(anton.className, "mt-2 text-xl uppercase leading-tight text-white sm:text-2xl")}>
                    {step.title}
                  </p>
                  {step.when && (
                    <p className="mt-1.5 text-[11px] font-bold uppercase tracking-widest text-white/45">{step.when}</p>
                  )}
                  <p className={cn(hind.className, "mt-2.5 max-w-[32ch] text-sm text-white/70")}>{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
