import { cn } from "@/lib/utils";

interface SermonPlayIndicatorProps {
  size?: "sm" | "lg";
  className?: string;
}

/** Botón circular ▶ superpuesto a una miniatura — puramente decorativo, el nombre accesible vive en el enlace/botón que lo envuelve. */
export function SermonPlayIndicator({ size = "sm", className }: SermonPlayIndicatorProps) {
  const dimension = size === "lg" ? "h-16 w-16 sm:h-20 sm:w-20" : "h-11 w-11";
  const iconSize = size === "lg" ? "h-6 w-6 sm:h-7 sm:w-7" : "h-4 w-4";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#FF7F50]",
        dimension,
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className={cn("translate-x-[1px]", iconSize)}>
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}
