"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const WORDS = [
  { word: "Prepárate", text: "Conoce con anticipación lo que necesitas para servir." },
  { word: "Practica", text: "La excelencia también se construye durante la semana." },
  { word: "Sirve", text: "Cada área es una oportunidad de honrar a Dios y cuidar a otros." },
  { word: "Crece", text: "Cada experiencia forma carácter, disciplina, fe y propósito." },
] as const;

/**
 * A diferencia de Reveal (que una vez visible se queda así), aquí la
 * palabra activa cambia según cuál está centrada en pantalla en cada
 * momento — por eso usa su propio IntersectionObserver con toggle en vez
 * de useScrollReveal.
 */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GenerationsRhythm() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState<Set<number>>(() =>
    prefersReducedMotion() ? new Set(WORDS.map((_, i) => i)) : new Set([0])
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setActive((prev) => {
          const next = new Set(prev);
          entries.forEach((entry) => {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx === -1) return;
            if (entry.isIntersecting) next.add(idx);
            else next.delete(idx);
          });
          return next;
        });
      },
      { threshold: 0.6, rootMargin: "-20% 0px -20% 0px" }
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <div>
          {WORDS.map((item, i) => {
            const isActive = active.has(i);
            return (
              <div
                key={item.word}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="grid gap-2 border-t border-white/10 py-7 last:border-b sm:grid-cols-[1fr_1.4fr] sm:items-center sm:gap-8 sm:py-10"
              >
                <p
                  className={cn(anton.className, "text-4xl uppercase leading-[0.9] transition-colors duration-500 ease-out motion-reduce:transition-none sm:text-7xl")}
                  style={{ color: isActive ? ABOUT_COLORS.coral : "rgba(255,255,255,.3)" }}
                >
                  {item.word}
                </p>
                <p className={cn(hind.className, "max-w-[44ch] text-white/70")}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
