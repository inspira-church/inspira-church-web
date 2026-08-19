import Image from "next/image";
import Link from "next/link";
import { EventCountdown } from "@/components/public/EventCountdown";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { formatDateRange, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/content";

type FeaturedEventProps = Pick<
  ChurchEvent,
  | "slug"
  | "name"
  | "subtitle"
  | "imageUrl"
  | "eventDate"
  | "eventTime"
  | "endDate"
  | "locationName"
  | "showCountdown"
>;

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

/**
 * "Próximo evento" — el futuro publicado más cercano, nunca elegido a
 * mano (ver deriveEventStatus + orden en app/(public)/eventos/page.tsx).
 * Composición editorial 60/40, imagen protagonista con overlay
 * permanente, nunca una tarjeta pequeña.
 */
export function FeaturedEvent({
  slug,
  name,
  subtitle,
  imageUrl,
  eventDate,
  eventTime,
  endDate,
  locationName,
  showCountdown,
}: FeaturedEventProps) {
  const { day, month } = eventDateParts(eventDate);

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
          Próximo evento
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[60%_1fr] lg:items-center lg:gap-12">
          <Link href={`/eventos/${slug}`} aria-label={`Ver evento: ${name}`} className="group relative aspect-video w-full overflow-hidden bg-black">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt=""
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-105"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
              aria-hidden="true"
            />
            <span
              className="absolute left-0 top-0 border px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm"
              style={{ borderColor: ABOUT_COLORS.coral, backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              Próximo
            </span>
          </Link>

          <div>
            <div className="flex items-baseline gap-2" style={{ color: ABOUT_COLORS.cream }}>
              <span className={cn(anton.className, "text-5xl leading-none")}>{day}</span>
              <span className="text-sm font-bold uppercase tracking-widest">{month}</span>
            </div>

            <h2
              className={cn(
                anton.className,
                "mt-3 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
              )}
            >
              {name}
            </h2>
            {subtitle && <p className={cn(hind.className, "mt-2 text-lg text-white/60")}>{subtitle}</p>}

            <p className="mt-4 text-white/70">
              {formatDateRange(eventDate, endDate)}
              {eventTime ? ` · ${formatTime(eventTime)}` : ""}
            </p>
            {locationName && <p className="mt-1 text-white/50">{locationName}</p>}

            {showCountdown && (
              <div className="mt-6 border-t border-white/10 pt-5">
                <EventCountdown eventDate={eventDate} eventTime={eventTime} />
              </div>
            )}

            <Link
              href={`/eventos/${slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors motion-reduce:transition-none hover:brightness-110"
              style={{ color: ABOUT_COLORS.coral }}
            >
              Ver evento
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
