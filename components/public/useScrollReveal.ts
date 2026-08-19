"use client";

import { useEffect, useRef, useState } from "react";

/**
 * true una sola vez que el elemento entra en viewport (no se re-oculta al
 * salir — evita animaciones repetitivas al hacer scroll arriba/abajo). El
 * consumidor debe agregar clases `motion-reduce:` para que, con
 * prefers-reduced-motion, el cambio de estado no se anime (sin necesidad de
 * bifurcar la lógica de este hook).
 */
export function useScrollReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, revealed };
}
