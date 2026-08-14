import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextAreaField({
  label,
  hint,
  id,
  name,
  required,
  className,
  rows = 5,
  ...rest
}: TextAreaFieldProps) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required={required}
        rows={rows}
        className={cn(
          "mt-1.5 w-full rounded-md border border-border-strong bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
