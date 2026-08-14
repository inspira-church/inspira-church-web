import type { Metadata } from "next";
import { EventCard } from "@/components/public/EventCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedEvents } from "@/lib/queries/events";

export const metadata: Metadata = {
  title: "Eventos | Inspira Church",
  description: "Próximos eventos y actividades de Inspira Church.",
};

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const upcoming = events
    .filter((e) => e.status !== "finalizado")
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const past = events
    .filter((e) => e.status === "finalizado")
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <SectionHeading
          eyebrow="Agenda"
          title="Eventos"
          description="Todo lo que está pasando en Inspira Church."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              slug={event.slug}
              name={event.name}
              imageUrl={event.imageUrl}
              eventDate={event.eventDate}
              eventTime={event.eventTime}
              locationName={event.locationName}
              status={event.status}
            />
          ))}
        </div>
      </Section>

      {past.length > 0 && (
        <Section tone="raised">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Eventos pasados
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((event) => (
              <EventCard
                key={event.id}
                slug={event.slug}
                name={event.name}
                imageUrl={event.imageUrl}
                eventDate={event.eventDate}
                eventTime={event.eventTime}
                locationName={event.locationName}
                status={event.status}
              />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
