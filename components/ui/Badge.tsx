import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  neutral: "bg-paper-raised border border-border text-ink-soft",
  accent: "bg-accent-soft text-accent",
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
}

/** Etiqueta corta: estado de evento, día de un grupo, tema de una prédica. */
export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
