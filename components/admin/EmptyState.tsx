import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vacío estándar — ícono opcional, mensaje principal, orientación
 * secundaria opcional, y una acción opcional (ej. "Agregar"). Reemplaza el
 * `<div className="border-dashed...">` que se repetía a mano en cada módulo.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border-strong p-10 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-faint">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-ink-soft">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
