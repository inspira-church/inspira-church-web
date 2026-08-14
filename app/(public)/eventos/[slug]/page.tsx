import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { formatDate, formatTime } from "@/lib/format";
import { getPublishedEventBySlug } from "@/lib/queries/events";
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

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-paper-raised">
            {event.imageUrl && (
              <Image
                src={event.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />
            )}
          </div>

          <Badge
            variant={event.status === "proximo" ? "accent" : "neutral"}
            className="mt-6"
          >
            {STATUS_LABEL[event.status]}
          </Badge>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            {event.name}
          </h1>
          {event.description && (
            <p className="mt-4 text-lg text-ink-soft">{event.description}</p>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-paper-raised p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Fecha
                </dt>
                <dd className="mt-1 text-ink">
                  {formatDate(event.eventDate)}
                  {event.eventTime ? ` · ${formatTime(event.eventTime)}` : ""}
                </dd>
              </div>
              {event.locationName && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Lugar
                  </dt>
                  <dd className="mt-1 text-ink">
                    {event.locationName}
                    {event.address && (
                      <span className="block text-sm text-ink-faint">
                        {event.address}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {event.capacity && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Cupos
                  </dt>
                  <dd className="mt-1 text-ink">{event.capacity} personas</dd>
                </div>
              )}
            </dl>

            {event.registrationUrl && event.status === "proximo" && (
              <Button
                as="a"
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full justify-center"
              >
                Inscribirme
              </Button>
            )}
          </div>

          {event.lat !== null && event.lng !== null && (
            <div className="h-64 overflow-hidden rounded-lg border border-border">
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
    </Section>
  );
}
