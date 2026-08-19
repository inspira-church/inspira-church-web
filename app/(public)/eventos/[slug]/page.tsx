import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/public/EventCard";
import { EventCountdown } from "@/components/public/EventCountdown";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { deriveEventStatus, registrationCtaLabel } from "@/lib/event-status";
import { formatDate, formatDateRange, formatTime } from "@/lib/format";
import { getPublishedEventBySlug, getRelatedEvents } from "@/lib/queries/events";
import { googleMapsLink, wazeLink } from "@/lib/maps";
import { getSiteUrl } from "@/lib/get-site-url";
import { cn } from "@/lib/utils";
import type { EventStatus } from "@/types/content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const STATUS_LABEL: Record<EventStatus, string> = {
  proximo: "Próximo",
  finalizado: "Evento finalizado",
  cancelado: "Cancelado",
};

const REGISTRATION_STATUS_LABEL: Record<string, string> = {
  abiertas: "Inscripciones abiertas",
  ultimos_cupos: "Últimos cupos",
  cerradas: "Inscripciones cerradas",
  agotado: "Cupos agotados",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return {};

  const siteUrl = await getSiteUrl();
  const description =
    event.description || `${event.name} — ${formatDate(event.eventDate)}, Inspira Church.`;

  return {
    title: `${event.name} | Inspira Church`,
    description,
    alternates: { canonical: `${siteUrl}/eventos/${event.slug}` },
    openGraph: {
      title: event.name,
      description,
      type: "website",
      url: `${siteUrl}/eventos/${event.slug}`,
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const status = deriveEventStatus(event);
  const related = await getRelatedEvents(event.id, event.category);
  const showLocation =
    event.modality !== "virtual" && event.locationPublic && event.lat !== null && event.lng !== null;
  const hasPracticalInfo = event.practicalInfo.length > 0;

  return (
    <>
      {/* Hero visual */}
      <section className="border-b border-white/10 bg-black">
        {event.imageUrl && (
          <div className="relative h-[24rem] w-full overflow-hidden sm:h-[32rem]">
            <Image src={event.imageUrl} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black from-10% via-black/60 via-40% to-transparent" />
          </div>
        )}
        <Container className={cn("pb-12 sm:pb-16", event.imageUrl ? "relative -mt-24 sm:-mt-28" : "pt-16 sm:pt-24")}>
          <span
            className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{
              borderColor: status === "cancelado" ? ABOUT_COLORS.red : ABOUT_COLORS.coral,
              color: status === "cancelado" ? ABOUT_COLORS.red : ABOUT_COLORS.coral,
            }}
          >
            {STATUS_LABEL[status]}
          </span>
          <h1 className={cn(anton.className, "mt-3 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl")}>
            {event.name}
          </h1>
          {event.subtitle && (
            <p className={cn(hind.className, "mt-2 text-xl text-white/60")}>{event.subtitle}</p>
          )}
          <p className="mt-4 text-white/70">{formatDateRange(event.eventDate, event.endDate)}</p>

          {event.showCountdown && status === "proximo" && (
            <div className="mt-6">
              <EventCountdown eventDate={event.eventDate} eventTime={event.eventTime} />
            </div>
          )}
        </Container>
      </section>

      {/* Franja Fecha | Hora | Lugar | Cupos */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-10">
        <Container>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
            <div className="lg:pr-6">
              <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Fecha</dt>
              <dd className="mt-1.5 text-white">{formatDateRange(event.eventDate, event.endDate)}</dd>
            </div>
            {event.eventTime && (
              <div className="lg:px-6">
                <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Hora</dt>
                <dd className="mt-1.5 text-white">{formatTime(event.eventTime)}</dd>
              </div>
            )}
            {event.locationName && (
              <div className="lg:px-6">
                <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Lugar</dt>
                <dd className="mt-1.5 text-white">{event.locationName}</dd>
              </div>
            )}
            {event.capacity && (
              <div className="lg:pl-6">
                <dt className="text-xs font-bold uppercase tracking-widest text-white/45">Capacidad</dt>
                <dd className="mt-1.5 text-white">{event.capacity} personas</dd>
              </div>
            )}
          </dl>
          {(event.cost || event.ageRange) && (
            <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 border-t border-white/10 pt-6">
              {event.cost && (
                <p className="text-white/70">
                  <span className="text-white/45">Costo:</span> {event.cost}
                </p>
              )}
              {event.ageRange && (
                <p className="text-white/70">
                  <span className="text-white/45">Edades:</span> {event.ageRange}
                </p>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* Descripción */}
      {event.description && (
        <section className="border-b border-white/10 bg-black py-16 sm:py-20">
          <Container>
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">Sobre este evento</p>
              <p className={cn(hind.className, "mt-3 text-lg leading-relaxed text-white/70")}>
                {event.description}
              </p>
            </div>
          </Container>
        </section>
      )}

      {/* Información práctica */}
      {hasPracticalInfo && (
        <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-20">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
              Información práctica
            </p>
            <dl className="mt-6 grid gap-8 sm:grid-cols-2">
              {event.practicalInfo.map((item, i) => (
                <div key={i}>
                  <dt className="font-semibold text-white">{item.title}</dt>
                  <dd className={cn(hind.className, "mt-1 text-white/60")}>{item.content}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* Cómo llegar */}
      {showLocation && (
        <section className="border-b border-white/10 bg-black py-16 sm:py-20">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
              Cómo llegar
            </p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                {event.locationName && <p className="text-lg text-white">{event.locationName}</p>}
                {event.address && <p className="mt-1 text-white/50">{event.address}</p>}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <a
                    href={googleMapsLink(event.lat as number, event.lng as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                    style={{ color: ABOUT_COLORS.coral }}
                  >
                    Google Maps →
                  </a>
                  <a
                    href={wazeLink(event.lat as number, event.lng as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                    style={{ color: ABOUT_COLORS.coral }}
                  >
                    Waze →
                  </a>
                </div>
              </div>
              <div className="h-64 overflow-hidden border border-white/10 lg:h-72">
                <SinglePointMap
                  lat={event.lat as number}
                  lng={event.lng as number}
                  label={event.name}
                  sublabel={event.locationName}
                />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Inscripción / evento finalizado */}
      {status === "finalizado" ? (
        <section className="border-b border-white/10 py-16 text-center sm:py-20" style={{ backgroundColor: ABOUT_COLORS.teal }}>
          <Container>
            <p className={cn(hind.className, "mx-auto max-w-md text-lg text-black/80")}>
              Este evento ya terminó. Descubre lo próximo que tenemos preparado.
            </p>
            <Link
              href="/eventos"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black hover:brightness-110"
            >
              Ver próximos eventos
              <span aria-hidden="true">→</span>
            </Link>
          </Container>
        </section>
      ) : (
        status === "proximo" &&
        event.requiresRegistration && (
          <section className="border-b border-white/10 py-16 text-center sm:py-24" style={{ backgroundColor: ABOUT_COLORS.teal }}>
            <Container>
              <p className="text-xs font-bold uppercase tracking-widest text-black/60">Participa</p>
              <h2 className={cn(anton.className, "mt-2 text-balance text-3xl uppercase leading-[1.05] text-black sm:text-4xl")}>
                ¿Quieres ser parte?
              </h2>

              {event.registrationStatus === "agotado" || event.registrationStatus === "cerradas" ? (
                <p className="mt-6 text-sm font-bold uppercase tracking-widest text-black/70">
                  {REGISTRATION_STATUS_LABEL[event.registrationStatus]}
                </p>
              ) : (
                event.registrationUrl && (
                  <>
                    <Link
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
                    >
                      {registrationCtaLabel(event.registrationUrl)}
                      <span aria-hidden="true">→</span>
                    </Link>
                    {event.registrationStatus && event.registrationStatus !== "abiertas" && (
                      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-black/60">
                        {REGISTRATION_STATUS_LABEL[event.registrationStatus]}
                      </p>
                    )}
                  </>
                )
              )}
            </Container>
          </section>
        )
      )}

      {/* Preguntas — conserva el evento de origen, no se le pide repetirlo en Contacto */}
      <section className="border-b border-white/10 bg-black py-10 text-center">
        <Container>
          <p className={cn(hind.className, "text-sm text-white/50")}>
            ¿Tienes preguntas sobre este evento?{" "}
            <Link
              href={`/contacto?evento=${event.slug}`}
              className="font-bold uppercase tracking-wide transition-colors hover:brightness-110"
              style={{ color: ABOUT_COLORS.coral }}
            >
              Contáctanos →
            </Link>
          </p>
        </Container>
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="bg-black py-16 sm:py-24">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
              También puede interesarte
            </p>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-3">
              {related.map((item) => (
                <EventCard
                  key={item.id}
                  slug={item.slug}
                  name={item.name}
                  subtitle={item.subtitle}
                  imageUrl={item.imageUrl}
                  eventDate={item.eventDate}
                  eventTime={item.eventTime}
                  endDate={item.endDate}
                  endTime={item.endTime}
                  locationName={item.locationName}
                  status={item.status}
                  requiresRegistration={item.requiresRegistration}
                  registrationUrl={item.registrationUrl}
                  registrationStatus={item.registrationStatus}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
