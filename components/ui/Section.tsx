import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  /** "raised" alterna el fondo para separar secciones sin usar líneas divisorias. */
  tone?: "default" | "raised";
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}

/** Ritmo vertical consistente entre secciones de una misma página. */
export function Section({
  id,
  tone = "default",
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-24",
        tone === "raised" && "bg-paper-raised",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
