import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/format";
import type { EventStatus } from "@/types/content";

interface EventCardProps {
  slug: string;
  name: string;
  imageUrl?: string | null;
  eventDate: string;
  eventTime?: string | null;
  locationName?: string | null;
  status: EventStatus;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  proximo: "Próximo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export function EventCard({
  slug,
  name,
  imageUrl,
  eventDate,
  eventTime,
  locationName,
  status,
}: EventCardProps) {
  return (
    <Card as={Link} href={`/eventos/${slug}`} interactive className="group block overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        <Badge
          variant={status === "proximo" ? "accent" : "neutral"}
          className="absolute left-3 top-3 bg-paper-raised/95"
        >
          {STATUS_LABEL[status]}
        </Badge>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {formatDate(eventDate)}
          {eventTime ? ` · ${formatTime(eventTime)}` : ""}
        </p>
        <h3 className="mt-1 text-balance font-display text-lg font-semibold text-ink">
          {name}
        </h3>
        {locationName && (
          <p className="mt-2 text-sm text-ink-faint">{locationName}</p>
        )}
      </div>
    </Card>
  );
}
