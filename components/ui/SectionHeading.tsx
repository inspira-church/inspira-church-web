import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** "h1" cuando este es el único encabezado principal de la página (por defecto "h2", para subsecciones). */
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </p>
      )}
      <Heading className="mt-2 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 text-lg text-ink-soft">{description}</p>
      )}
    </div>
  );
}
