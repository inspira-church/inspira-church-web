interface PlaceholderModuleProps {
  title: string;
  description: string;
  phase: string;
}

/** Módulo sin construir todavía — evita que el sidebar lleve a un 404. */
export function PlaceholderModule({ title, description, phase }: PlaceholderModuleProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink-faint">{description}</p>
      <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
        <p className="text-ink-soft">Este módulo se construye en la {phase}.</p>
      </div>
    </div>
  );
}
