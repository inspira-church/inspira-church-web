import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/public/EventCard";
import { EventsClosingCTA } from "@/components/public/EventsClosingCTA";
import { FeaturedEvent } from "@/components/public/FeaturedEvent";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, CAMPAIGN_COLORS, anton, hind } from "@/lib/fonts";
import { deriveEventStatus, eventStartMoment } from "@/lib/event-status";
import { getPublishedEvents } from "@/lib/queries/events";
import { cn } from "@/lib/utils";
import type { ChurchEvent } from "@/types/content";

export const metadata: Metadata = {
  title: "Eventos | Inspira Church",
  description:
    "Descubre lo que viene, encuentra tu próximo espacio para conectar y sé parte de lo que Dios está haciendo en nuestra comunidad.",
};

export default async function EventsPage() {
  let events: ChurchEvent[] = [];
  let loadError = false;

  try {
    events = await getPublishedEvents();
  } catch {
    loadError = true;
  }

  if (loadError) {
    return (
      <section className="bg-black py-24 text-center">
        <Container>
          <p className={cn(anton.className, "text-2xl uppercase text-white")}>
            No pudimos cargar los eventos en este momento.
          </p>
          <Link
            href="/eventos"
            className="mt-6 inline-block text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
            style={{ color: ABOUT_COLORS.coral }}
          >
            Intentar de nuevo →
          </Link>
        </Container>
      </section>
    );
  }

  const upcomingSorted = events
    .filter((e) => deriveEventStatus(e) === "proximo")
    .sort((a, b) => eventStartMoment(a).getTime() - eventStartMoment(b).getTime());

  const featured = upcomingSorted[0] ?? null;
  const upcoming = featured ? upcomingSorted.filter((e) => e.id !== featured.id) : upcomingSorted;

  const past = events
    .filter((e) => deriveEventStatus(e) === "finalizado")
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <p
            className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: ABOUT_COLORS.coral, color: ABOUT_COLORS.coral }}
          >
            Agenda
          </p>
          <h1
            className={cn(
              anton.className,
              "mt-5 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-6xl"
            )}
          >
            Eventos
          </h1>
          <p className={cn(hind.className, "mt-5 max-w-xl text-lg text-white/70")}>
            Descubre lo que viene, encuentra tu próximo espacio para conectar y sé parte de lo que
            Dios está haciendo en nuestra comunidad.
          </p>
        </Container>
      </section>

      {featured && (
        <FeaturedEvent
          slug={featured.slug}
          name={featured.name}
          subtitle={featured.subtitle}
          imageUrl={featured.imageUrl}
          eventDate={featured.eventDate}
          eventTime={featured.eventTime}
          endDate={featured.endDate}
          locationName={featured.locationName}
          showCountdown={featured.showCountdown}
        />
      )}

      <section className={cn("bg-black py-16 sm:py-24", past.length > 0 && "border-b border-white/10")}>
        <Container>
          {!featured && upcoming.length === 0 ? (
            <div className="text-center">
              <p className={cn(anton.className, "text-2xl uppercase text-white")}>
                Estamos preparando lo que viene
              </p>
              <p className={cn(hind.className, "mt-3 text-white/60")}>
                Muy pronto encontrarás aquí nuestros próximos encuentros.
              </p>
            </div>
          ) : upcoming.length > 0 ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
                Lo que viene
              </p>
              <h2
                className={cn(
                  anton.className,
                  "mt-2 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
                )}
              >
                Próximos eventos
              </h2>
              <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event, i) => (
                  <EventCard
                    key={event.id}
                    slug={event.slug}
                    name={event.name}
                    subtitle={event.subtitle}
                    imageUrl={event.imageUrl}
                    eventDate={event.eventDate}
                    eventTime={event.eventTime}
                    endDate={event.endDate}
                    endTime={event.endTime}
                    locationName={event.locationName}
                    status={event.status}
                    requiresRegistration={event.requiresRegistration}
                    registrationUrl={event.registrationUrl}
                    registrationStatus={event.registrationStatus}
                    accentColor={CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length]}
                  />
                ))}
              </div>
            </>
          ) : null}
        </Container>
      </section>

      {past.length > 0 && (
        <section className="bg-[#0d0d0d] py-16 sm:py-24">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest text-white/45">Así lo vivimos</p>
            <h2 className={cn(anton.className, "mt-2 text-2xl uppercase leading-tight text-white")}>
              Eventos pasados
            </h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event, i) => (
                <EventCard
                  key={event.id}
                  slug={event.slug}
                  name={event.name}
                  subtitle={event.subtitle}
                  imageUrl={event.imageUrl}
                  eventDate={event.eventDate}
                  eventTime={event.eventTime}
                  endDate={event.endDate}
                  endTime={event.endTime}
                  locationName={event.locationName}
                  status={event.status}
                  requiresRegistration={event.requiresRegistration}
                  registrationUrl={event.registrationUrl}
                  registrationStatus={event.registrationStatus}
                  accentColor={CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <EventsClosingCTA />
    </>
  );
}

