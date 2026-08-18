import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Agrupa campos relacionados dentro de un formulario largo, con un separador sutil. */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-5 border-t border-border pt-6 first:border-0 first:pt-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</p>
        {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
      </div>
      {children}
    </div>
  );
}
