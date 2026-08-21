"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/components/public/useScrollReveal";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** ms — para escalonar varios Reveal hermanos sin repetir el hook a mano. */
  delay?: number;
}

/** Fade + rise genérico al entrar en viewport — mismo mecanismo que useScrollReveal ya usa en AboutHero/PastoralTeam/LeadershipMosaic, envuelto para no repetir el hook en cada bloque suelto de Generaciones. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
