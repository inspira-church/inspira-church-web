import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border bg-paper-raised", className)}>
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
        {children}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className, ...rest }: ComponentPropsWithoutRef<"tr">) {
  return (
    <tr className={cn("transition-colors duration-150 hover:bg-ink/5", className)} {...rest}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"th">) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)} {...rest}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...rest }: ComponentPropsWithoutRef<"td">) {
  return (
    <td className={cn("px-4 py-3", className)} {...rest}>
      {children}
    </td>
  );
}
