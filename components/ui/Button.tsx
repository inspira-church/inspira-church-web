import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  secondary:
    "border border-border-strong text-ink bg-transparent hover:bg-paper-raised",
  ghost: "text-ink hover:bg-paper-raised",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  default: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

/** Botón polimórfico: `as={Link}` para CTAs que navegan, por defecto <button>. */
export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "default",
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Tag = as ?? "button";

  return (
    <Tag
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
