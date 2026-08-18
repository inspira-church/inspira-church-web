import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { EventCard } from "@/components/public/EventCard";
import { Container } from "@/components/ui/Container";
import { anton, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { getPublishedEvents } from "@/lib/queries/events";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Eventos | Inspira Church",
  description: "Próximos eventos y actividades de Inspira Church.",
};

/** Eventos hereda el color que Inicio ya le asocia en su sección "Próximos eventos". */
const PAGE_COLOR = CAMPAIGN_COLORS[2];

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
      <section className={cn("border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24", (upcoming.length > 0 || past.length > 0) && "border-b")}>
        <Container>
          <Eyebrow color={PAGE_COLOR}>Agenda</Eyebrow>
          <PosterHeading>Eventos</PosterHeading>
          <p className={cn(hind.className, "mt-4 max-w-xl text-white/70")}>
            Todo lo que está pasando en Inspira Church.
          </p>
        </Container>
      </section>

      <section className={cn("bg-[#0d0d0d] py-16 sm:py-24", past.length > 0 && "border-b border-white/10")}>
        <Container>
          {upcoming.length === 0 ? (
            <div className="border border-dashed border-white/15 bg-black px-8 py-14 text-center">
              <p className="text-white/50">
                Muy pronto vamos a anunciar nuevos eventos — vuelve pronto para no perdértelos.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, i) => (
                <EventCard
                  key={event.id}
                  slug={event.slug}
                  name={event.name}
                  imageUrl={event.imageUrl}
                  eventDate={event.eventDate}
                  eventTime={event.eventTime}
                  locationName={event.locationName}
                  description={event.description}
                  registrationUrl={event.registrationUrl}
                  status={event.status}
                  accentColor={CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length]}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {past.length > 0 && (
        <section className="bg-black py-16 sm:py-24">
          <Container>
            <h2 className={cn(anton.className, "text-2xl uppercase leading-tight text-white")}>
              Eventos pasados
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event, i) => (
                <EventCard
                  key={event.id}
                  slug={event.slug}
                  name={event.name}
                  imageUrl={event.imageUrl}
                  eventDate={event.eventDate}
                  eventTime={event.eventTime}
                  locationName={event.locationName}
                  description={event.description}
                  registrationUrl={event.registrationUrl}
                  status={event.status}
                  accentColor={CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length]}
                  muted
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
