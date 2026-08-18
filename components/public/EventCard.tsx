import Image from "next/image";
import Link from "next/link";
import { anton, hind } from "@/lib/fonts";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/content";

interface EventCardProps {
  slug: string;
  name: string;
  imageUrl?: string | null;
  eventDate: string;
  eventTime?: string | null;
  locationName?: string | null;
  description?: string | null;
  registrationUrl?: string | null;
  status: EventStatus;
  /** Color de acento rotativo (CAMPAIGN_COLORS) — mismo patrón que Inicio. */
  accentColor?: string;
  /** Eventos pasados — misma tarjeta, atenuada. */
  muted?: boolean;
}

function eventDateParts(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  return {
    day: date.toLocaleDateString("es-CO", { day: "2-digit" }),
    month: date
      .toLocaleDateString("es-CO", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
  };
}

/** Misma receta que las tarjetas de "Próximos eventos" de Inicio — aquí como componente reutilizable para /eventos. */
export function EventCard({
  slug,
  name,
  imageUrl,
  eventDate,
  eventTime,
  locationName,
  description,
  registrationUrl,
  status,
  accentColor = "#ff8a3d",
  muted = false,
}: EventCardProps) {
  const { day, month } = eventDateParts(eventDate);

  return (
    <Link
      href={`/eventos/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden border border-white/10 bg-black transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-110",
        muted && "opacity-55 hover:opacity-80"
      )}
    >
      {imageUrl && (
        <div className="relative aspect-video w-full shrink-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline gap-1.5" style={{ color: accentColor }}>
          <span className={cn(anton.className, "text-4xl leading-none")}>{day}</span>
          <span className="text-xs font-bold uppercase tracking-widest">{month}</span>
        </div>
        <h3 className={cn(anton.className, "mt-3 text-xl uppercase leading-tight text-white")}>
          {name}
        </h3>
        {description && (
          <p className={cn(hind.className, "mt-2 line-clamp-2 text-sm text-white/60")}>
            {description}
          </p>
        )}
        <p className="mt-4 text-sm text-white/50">
          {eventTime ? formatTime(eventTime) : ""}
          {eventTime && locationName ? " · " : ""}
          {locationName}
        </p>
        <p
          className="mt-auto pt-5 text-sm font-bold uppercase tracking-wide"
          style={{ color: accentColor }}
        >
          {status === "proximo" ? (registrationUrl ? "Inscribirme" : "Ver más") : "Ver más"}{" "}
          <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
