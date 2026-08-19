import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Equivalentes oscuros de components/ui/TextField|SelectField|TextAreaField|
 * CheckboxField, con la misma API mínima — para los formularios que viven en
 * páginas cartel (Contacto, Grupos/unirme). No se tocan los originales:
 * el panel admin y cualquier página futura del sistema claro los siguen usando.
 */

const fieldClasses =
  "mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]";

interface CartelFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function CartelField({ label, hint, id, name, required, className, ...rest }: CartelFieldProps) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-bold uppercase tracking-wide text-white/70">
        {label}
        {required && <span className="text-[#FF7F50]"> *</span>}
      </label>
      <input
        id={fieldId}
        name={name}
        required={required}
        className={cn(fieldClasses, className)}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

interface CartelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function CartelSelect({
  label,
  placeholder,
  options,
  id,
  name,
  required,
  className,
  ...rest
}: CartelSelectProps) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-bold uppercase tracking-wide text-white/70">
        {label}
        {required && <span className="text-[#FF7F50]"> *</span>}
      </label>
      <select
        id={fieldId}
        name={name}
        required={required}
        className={cn(fieldClasses, className)}
        {...rest}
      >
        {placeholder && (
          <option value="" className="bg-black">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-black">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CartelTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function CartelTextArea({
  label,
  hint,
  id,
  name,
  required,
  className,
  rows = 5,
  ...rest
}: CartelTextAreaProps) {
  const fieldId = id ?? name;
  return (
    <div>
      <label htmlFor={fieldId} className="text-xs font-bold uppercase tracking-wide text-white/70">
        {label}
        {required && <span className="text-[#FF7F50]"> *</span>}
      </label>
      <textarea
        id={fieldId}
        name={name}
        required={required}
        rows={rows}
        className={cn(fieldClasses, className)}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

interface CartelCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function CartelCheckbox({ label, id, name, required, ...rest }: CartelCheckboxProps) {
  const fieldId = id ?? name;
  return (
    <label htmlFor={fieldId} className={cn(hind.className, "flex items-start gap-3 text-sm text-white/60")}>
      <input
        type="checkbox"
        id={fieldId}
        name={name}
        required={required}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-white/5 text-[#FF7F50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}

interface CartelRadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  "aria-describedby"?: string;
}

export function CartelRadioGroup({
  label,
  name,
  options,
  defaultValue,
  required,
  onChange,
  "aria-describedby": ariaDescribedBy,
}: CartelRadioGroupProps) {
  return (
    <fieldset aria-describedby={ariaDescribedBy}>
      <legend className="text-xs font-bold uppercase tracking-wide text-white/70">
        {label}
        {required && <span className="text-[#FF7F50]"> *</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(hind.className, "flex items-center gap-2 text-sm text-white/80")}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              required={required}
              onChange={onChange ? () => onChange(option.value) : undefined}
              className="h-4 w-4 border-white/25 bg-white/5 text-[#FF7F50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Misma receta visual que PosterButton (cartel.tsx), pero como &lt;button&gt; real — CTA secundario dentro de un formulario (ej. "Cancelar"). */
export function CartelGhostButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md border-2 border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface CartelSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingText?: string;
}

/** Misma receta visual que GoldButton (cartel.tsx), pero como &lt;button&gt; real para submits de formulario. */
export function CartelSubmitButton({
  children,
  pending,
  pendingText = "Enviando…",
  className,
  disabled,
  ...rest
}: CartelSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled ?? pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-[#FF7F50] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...rest}
    >
      {pending ? pendingText : children}
    </button>
  );
}
