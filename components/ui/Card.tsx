import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardOwnProps<T extends ElementType> = {
  as?: T;
  /** Para tarjetas que son un enlace completo (prédica, evento, grupo). */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
};

type CardProps<T extends ElementType> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export function Card<T extends ElementType = "div">({
  as,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag
      className={cn(
        "rounded-lg border border-border bg-paper-raised",
        interactive &&
          "transition-colors duration-150 hover:border-border-strong",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
