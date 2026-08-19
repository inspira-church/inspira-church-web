import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
}

export function CheckboxField({ label, hint, id, name, required, ...rest }: CheckboxFieldProps) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="flex items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          id={fieldId}
          name={name}
          required={required}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...rest}
        />
        <span>{label}</span>
      </label>
      {hint && <p className="mt-1 pl-7 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
