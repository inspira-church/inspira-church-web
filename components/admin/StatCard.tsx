import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const toneStyles = {
  default: "bg-accent-soft text-accent",
  attention: "bg-warning-soft text-warning",
} as const;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  /** "attention" resalta la tarjeta en ámbar — usar solo cuando el valor requiere acción. */
  tone?: keyof typeof toneStyles;
  hint?: string;
}

export function StatCard({ icon: Icon, label, value, tone = "default", hint }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
          toneStyles[tone]
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        <p className="truncate text-sm text-ink-soft">{label}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-ink-faint">{hint}</p>}
      </div>
    </Card>
  );
}
