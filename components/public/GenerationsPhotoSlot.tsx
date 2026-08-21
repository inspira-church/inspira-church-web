import Image from "next/image";
import { cn } from "@/lib/utils";

interface GenerationsPhotoSlotProps {
  photoUrl?: string | null;
  alt?: string;
  label: string;
  tint: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Todavía no hay fotos reales de Generaciones cargadas — mismo patrón que
 * PLACEHOLDER_SLIDES en Hero.tsx (degradado con el color de la sección +
 * etiqueta) en vez de una foto inventada. El componente ya acepta
 * `photoUrl`, así que en cuanto exista un módulo de `media` administrable
 * para Generaciones, basta con pasarle la URL real — no hace falta tocar
 * ningún consumidor de este componente.
 */
export function GenerationsPhotoSlot({
  photoUrl,
  alt = "",
  label,
  tint,
  className,
  sizes = "100vw",
  priority,
}: GenerationsPhotoSlotProps) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={alt}
        fill
        priority={priority}
        className={cn("object-cover", className)}
        sizes={sizes}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
      style={{ background: `radial-gradient(120% 100% at 20% 15%, ${tint}55 0%, #0a0a0a 78%)` }}
    >
      {label && (
        <span className="absolute right-3 top-3 rounded border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
          {label}
        </span>
      )}
    </div>
  );
}
