import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GoldButton } from "@/components/public/cartel";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Container } from "@/components/ui/Container";
import { anton, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { formatDate, formatTime } from "@/lib/format";
import { getPublishedEventBySlug } from "@/lib/queries/events";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  proximo: "Próximo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.name} | Inspira Church`,
    description: event.description,
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const color = CAMPAIGN_COLORS[2];

  return (
    <section className="border-b border-white/10 bg-black">
      {event.imageUrl && (
        <div className="relative h-[22rem] w-full overflow-hidden sm:h-[28rem]">
          <Image src={event.imageUrl} alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black from-10% via-black/70 via-40% to-transparent" />
        </div>
      )}
      <Container
        className={cn("relative pb-16 sm:pb-24", event.imageUrl ? "-mt-20 sm:-mt-24" : "pt-16 sm:pt-24")}
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <span
              className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ borderColor: color, color }}
            >
              {STATUS_LABEL[event.status]}
            </span>
            <h1 className={cn(anton.className, "mt-3 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl")}>
              {event.name}
            </h1>
            {event.description && (
              <p className={cn(hind.className, "mt-4 text-lg text-white/70")}>{event.description}</p>
            )}
          </div>

          <aside className="space-y-6">
            <div className="border border-white/10 bg-[#0d0d0d] p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Fecha</dt>
                  <dd className="mt-1 text-white">
                    {formatDate(event.eventDate)}
                    {event.eventTime ? ` · ${formatTime(event.eventTime)}` : ""}
                  </dd>
                </div>
                {event.locationName && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Lugar</dt>
                    <dd className="mt-1 text-white">
                      {event.locationName}
                      {event.address && (
                        <span className="block text-sm text-white/45">{event.address}</span>
                      )}
                    </dd>
                  </div>
                )}
                {event.capacity && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Cupos</dt>
                    <dd className="mt-1 text-white">{event.capacity} personas</dd>
                  </div>
                )}
              </dl>

              {event.registrationUrl && event.status === "proximo" && (
                <div className="mt-6">
                  <GoldButton
                    href={event.registrationUrl}
                    color={color}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscribirme
                  </GoldButton>
                </div>
              )}
            </div>

            {event.lat !== null && event.lng !== null && (
              <div className="h-64 overflow-hidden border border-white/10">
                <SinglePointMap
                  lat={event.lat}
                  lng={event.lng}
                  label={event.name}
                  sublabel={event.locationName}
                />
              </div>
            )}
          </aside>
        </div>
      </Container>
    </section>
  );
}
