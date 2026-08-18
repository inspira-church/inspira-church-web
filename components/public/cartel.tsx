import { CalendarDays, HandHeart, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { anton } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Piezas compartidas del lenguaje visual de cartel real de @inspira.church
 * (negro, Anton, acento dorado/color de campaña rotativo) — usado en
 * Inicio y en las páginas que continúan directamente desde ahí (por
 * ejemplo /primera-vez). El resto del sitio (Nosotros, Prédicas, Grupos,
 * Eventos, Contacto, /oraciones) y el panel admin siguen con el sistema
 * de diseño original en globals.css, sin cambios.
 */

export function Eyebrow({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p
      className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
      style={{ borderColor: color, color }}
    >
      {children}
    </p>
  );
}

export function PosterHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className={cn(
        anton.className,
        "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
      )}
    >
      {children}
    </h2>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
    >
      {children} →
    </Link>
  );
}

/** Botón con borde — CTA secundario sobre fondo negro. */
export function PosterButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border-2 border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white"
    >
      {children}
    </Link>
  );
}

/** Botón sólido dorado/color de campaña — CTA principal (ej. "Planea tu visita"). */
export function GoldButton({
  href,
  children,
  color,
  target,
  rel,
}: {
  href: string;
  children: ReactNode;
  color: string;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="group inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
      style={{ backgroundColor: color }}
    >
      {children}
      <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/** Ícono discreto según el nombre del horario — solo apoya la lectura, no reemplaza el texto. */
export function scheduleIcon(name: string): LucideIcon {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (normalized.includes("oracion")) return HandHeart;
  if (normalized.includes("joven")) return Users;
  return CalendarDays;
}
