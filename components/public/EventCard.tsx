import Image from "next/image";
import Link from "next/link";
import { deriveEventStatus, registrationCtaLabel } from "@/lib/event-status";
import { anton, hind } from "@/lib/fonts";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/content";

interface EventCardProps
  extends Pick<
    ChurchEvent,
    | "slug"
    | "name"
    | "subtitle"
    | "imageUrl"
    | "eventDate"
    | "eventTime"
    | "endDate"
    | "endTime"
    | "locationName"
    | "status"
    | "requiresRegistration"
    | "registrationUrl"
    | "registrationStatus"
  > {
  /** Color de acento rotativo (CAMPAIGN_COLORS) — mismo patrón que Inicio. */
  accentColor?: string;
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

const OVERLAY_LABEL: Record<string, string> = {
  finalizado: "Finalizado",
  cancelado: "Cancelado",
  agotado: "Agotado",
};

/** Tarjeta ligera de /eventos — imagen, fecha, título, subtítulo, hora·lugar, CTA. Sin caja negra pesada alrededor. */
export function EventCard({
  slug,
  name,
  subtitle,
  imageUrl,
  eventDate,
  eventTime,
  endDate,
  endTime,
  locationName,
  status,
  requiresRegistration,
  registrationUrl,
  registrationStatus,
  accentColor = "#ff8a3d",
}: EventCardProps) {
  const derived = deriveEventStatus({ status, eventDate, eventTime, endDate, endTime });
  const muted = derived === "finalizado" || derived === "cancelado";
  const overlay = derived !== "proximo" ? derived : registrationStatus === "agotado" ? "agotado" : null;
  const { day, month } = eventDateParts(eventDate);

  const ctaLabel =
    derived === "proximo" && requiresRegistration && registrationUrl
      ? registrationCtaLabel(registrationUrl)
      : "Ver más";

  return (
    <Link
      href={`/eventos/${slug}`}
      className={cn(
        "group flex flex-col transition-opacity duration-300 ease-out motion-reduce:transition-none",
        muted && "opacity-60 hover:opacity-90"
      )}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#0d0d0d]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        {overlay && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white",
              overlay === "agotado" || overlay === "cancelado" ? "bg-[#87281B]" : "bg-black/70"
            )}
          >
            {OVERLAY_LABEL[overlay]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline gap-1.5" style={{ color: accentColor }}>
          <span className={cn(anton.className, "text-3xl leading-none")}>{day}</span>
          <span className="text-xs font-bold uppercase tracking-widest">{month}</span>
        </div>
        <h3 className={cn(anton.className, "mt-2 text-xl uppercase leading-tight text-white")}>
          {name}
        </h3>
        {subtitle && <p className={cn(hind.className, "mt-1 text-sm text-white/60")}>{subtitle}</p>}
        <p className="mt-3 text-sm text-white/50">
          {eventTime ? formatTime(eventTime) : ""}
          {eventTime && locationName ? " · " : ""}
          {locationName}
        </p>
        <p
          className="mt-auto pt-4 text-sm font-bold uppercase tracking-wide"
          style={{ color: accentColor }}
        >
          {ctaLabel}{" "}
          <span className="inline-block transition-transform duration-200 motion-reduce:transition-none group-hover:translate-x-1">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
