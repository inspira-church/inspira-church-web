import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Eyebrow, GoldButton, PosterButton, PosterHeading, TextLink, scheduleIcon } from "@/components/public/cartel";
import { Hero } from "@/components/public/Hero";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { Container } from "@/components/ui/Container";
import { dayName, formatDate, formatTime, prayerModality } from "@/lib/format";
import { anton, caveat, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { PRAYER_TOPIC, SITE_CONFIG } from "@/lib/constants";
import { isEventUpcoming } from "@/lib/event-status";
import { googleMapsLink } from "@/lib/maps";
import { getPublishedEvents } from "@/lib/queries/events";
import { getHeroSlides } from "@/lib/queries/media";
import { getActiveSchedules, getPrayerSchedules } from "@/lib/queries/schedules";
import { getLatestSermonByTopic } from "@/lib/queries/sermons";
import { getSiteSettings } from "@/lib/queries/settings";
import { getTeamMemberById } from "@/lib/queries/team-members";
import { getCurrentLiveVideo } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/**
 * Todo Inicio usa el lenguaje de cartel real de @inspira.church (negro,
 * Anton, script Caveat, color de campaña rotativo) — ver Hero.tsx y
 * components/public/cartel.tsx (piezas compartidas con /primera-vez). Las
 * demás páginas (Nosotros, Prédicas, Grupos, Eventos, Contacto, /oraciones)
 * y el panel admin siguen con el sistema de diseño original en
 * globals.css, sin cambios. Por eso este archivo no reutiliza
 * SermonCard/EventCard/GroupCard (esos siguen tal cual para sus páginas
 * propias) sino que arma tarjetas propias, solo para Inicio.
 */

/** Día y mes por separado para el bloque de fecha destacado de las tarjetas de evento. */
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

export default async function HomePage() {
  const prayerRecording = await getLatestSermonByTopic(PRAYER_TOPIC);
  const [prayerPreacher, schedules, prayerSchedules, events, settings, heroSlides] =
    await Promise.all([
      getTeamMemberById(prayerRecording?.preacher_id ?? null),
      getActiveSchedules(),
      getPrayerSchedules(),
      getPublishedEvents(),
      getSiteSettings(),
      getHeroSlides(),
    ]);
  const liveVideo = await getCurrentLiveVideo(settings.youtubeChannelId || null);

  const upcomingEvents = events
    .filter((e) => isEventUpcoming(e))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <Hero slides={heroSlides} texts={[settings.heroText1, settings.heroText2]} />

      {/* Bienvenida */}
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow color={CAMPAIGN_COLORS[0]}>Bienvenido a Inspira Church</Eyebrow>
              <h1
                className={cn(
                  anton.className,
                  "mt-5 text-balance text-4xl uppercase leading-[1.05] text-white sm:text-5xl"
                )}
              >
                Una comunidad que
                <span className="block" style={{ color: CAMPAIGN_COLORS[0] }}>
                  te inspira a crecer
                </span>
              </h1>
              <p className={cn(hind.className, "mt-5 max-w-sm text-white/70")}>
                Un lugar para encontrarte con Dios, crecer en comunidad y
                caminar en propósito.
              </p>
              <div className="mt-7">
                <GoldButton href="/contacto" color={CAMPAIGN_COLORS[0]}>
                  Planea tu visita
                </GoldButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              {schedules.map((s) => {
                const Icon = scheduleIcon(s.name);
                return (
                  <div key={s.id} className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-1.5 text-white/45">
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        {s.name}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-white/60">
                      {dayName(s.day_of_week)}
                    </p>
                    <p className={cn(anton.className, "mt-0.5 text-2xl text-white")}>
                      {formatTime(s.time_of_day)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-white/10 pt-8">
            <div>
              <div className="flex items-center gap-1.5 text-white/45">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Sede Bogotá
                </p>
              </div>
              <p className="mt-2 text-lg text-white/85">
                {(settings.churchAddress || SITE_CONFIG.city).replace(/,\s*/, " · ")}
              </p>
            </div>
            {settings.churchLat != null && settings.churchLng != null && (
              <a
                href={googleMapsLink(settings.churchLat, settings.churchLng)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide transition-colors duration-200"
                style={{ color: CAMPAIGN_COLORS[0] }}
              >
                Cómo llegar
                <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-1">
                  →
                </span>
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* En vivo — solo aparece mientras el canal está transmitiendo */}
      {liveVideo && (
        <section className="border-b border-white/10 bg-black py-16 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
                En vivo
              </span>
              <p className={cn(anton.className, "text-2xl uppercase text-white")}>
                {liveVideo.title}
              </p>
            </div>
            <div className="mt-6 max-w-3xl">
              <YouTubeEmbed
                url={`https://www.youtube.com/watch?v=${liveVideo.videoId}`}
                title={liveVideo.title}
              />
            </div>
          </Container>
        </section>
      )}

      {/* Elige tu camino */}
      <section className="border-b border-white/10 bg-[#0d0d0d] pb-16 pt-8 sm:pb-24 sm:pt-12">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[4]}>¿Eres nuevo?</Eyebrow>
          <PosterHeading>Te estábamos esperando</PosterHeading>
          <p
            className={cn(caveat.className, "mt-2 -rotate-1 text-3xl")}
            style={{ color: CAMPAIGN_COLORS[4] }}
          >
            ¡En Inspira Church siempre habrá un lugar para ti!
          </p>

          <Link
            href="/primera-vez"
            className="group mt-10 flex items-center justify-between border-y-2 py-5 transition-colors hover:bg-white/5"
            style={{ borderColor: CAMPAIGN_COLORS[4] }}
          >
            <span
              className={cn(
                anton.className,
                "text-xl uppercase tracking-wide text-white sm:text-2xl"
              )}
            >
              Da el siguiente paso
            </span>
            <span
              className="text-3xl transition-transform group-hover:translate-x-2"
              style={{ color: CAMPAIGN_COLORS[4] }}
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </Container>
      </section>

      {/* Tres pasos */}
      <section className="border-b border-white/10 bg-black pb-16 pt-8 sm:pb-24 sm:pt-12">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[2]}>Tu recorrido en Inspira</Eyebrow>
          <PosterHeading>Tres pasos para conocernos</PosterHeading>
          <p className={cn(hind.className, "mt-3 max-w-xl text-base text-white/70")}>
            Empieza por aquí. Tres formas sencillas de descubrir quiénes
            somos, conectar y crecer juntos.
          </p>

          <div className="mt-8 flex flex-col gap-6">
            {[
              {
                color: CAMPAIGN_COLORS[2],
                num: "01",
                step: "Paso 1",
                title: "Conoce nuestra historia",
                description:
                  "Descubre quiénes somos, qué creemos y hacia dónde vamos.",
                cta: "Conócenos",
                href: "/nosotros",
              },
              {
                color: CAMPAIGN_COLORS[3],
                num: "02",
                step: "Paso 2",
                title: "Encuentra tu grupo",
                description:
                  "La vida es mejor en comunidad. Conecta, comparte y crece.",
                cta: "Ver grupos",
                href: "/grupos",
              },
              {
                color: CAMPAIGN_COLORS[4],
                num: "03",
                step: "Paso 3",
                title: "Crece en la palabra",
                description:
                  "Escucha el mensaje de esta semana y sigue creciendo en tu fe.",
                cta: "Ver prédicas",
                href: "/predicas",
              },
            ].map((s) => (
              <Link
                key={s.step}
                href={s.href}
                className="group relative block overflow-hidden px-7 py-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-110 sm:px-10 sm:py-8"
                style={{ backgroundColor: `${s.color}4d` }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    anton.className,
                    "pointer-events-none absolute -right-2 bottom-0 select-none text-[6rem] leading-none sm:-right-3 sm:text-[9rem]"
                  )}
                  style={{ color: s.color, opacity: 0.22 }}
                >
                  {s.num}
                </span>

                <div className="relative z-10 max-w-lg">
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: s.color }}
                  >
                    {s.step}
                  </p>
                  <p
                    className={cn(
                      anton.className,
                      "mt-1.5 text-2xl uppercase leading-[0.95] text-white sm:text-3xl"
                    )}
                  >
                    {s.title}
                  </p>
                  <p className={cn(hind.className, "mt-3 text-sm text-white/70 sm:text-base")}>
                    {s.description}
                  </p>
                  <p
                    className="mt-4 text-sm font-bold uppercase tracking-wide"
                    style={{ color: s.color }}
                  >
                    {s.cta}{" "}
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Oración de la semana */}
      <section className="border-b border-white/10 bg-[#0d0d0d] pb-16 pt-8 sm:pb-24 sm:pt-12">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[0]}>Nuestro tiempo de oración</Eyebrow>
          <PosterHeading>Ora con nosotros</PosterHeading>
          <p className={cn(hind.className, "mt-4 max-w-2xl text-white/70")}>
            Revive nuestra oración más reciente y acompáñanos cada semana en
            este tiempo de búsqueda, fe y comunión con Dios.
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <Link
              href={prayerRecording ? `/oraciones/${prayerRecording.slug}` : "/oraciones"}
              className="group relative block aspect-video overflow-hidden border border-white/10 bg-[#0d0d0d]"
            >
              {prayerRecording?.thumbnail_url ? (
                <Image
                  src={prayerRecording.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <p className="text-sm text-white/40">
                    Muy pronto vas a poder revivir aquí nuestra última oración.
                  </p>
                </div>
              )}
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: CAMPAIGN_COLORS[0] }}
                aria-hidden="true"
              />
            </Link>

            <div className="flex flex-col gap-6">
              {prayerRecording ? (
                <div>
                  <h3
                    className={cn(
                      anton.className,
                      "text-2xl uppercase leading-tight text-white sm:text-3xl"
                    )}
                  >
                    {prayerRecording.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">
                    {prayerPreacher?.full_name ? `${prayerPreacher.full_name} · ` : ""}
                    {formatDate(prayerRecording.sermon_date)}
                  </p>
                  {prayerRecording.description && (
                    <p className="mt-4 text-white/70">{prayerRecording.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-white/60">
                  Aún no hay una grabación de oración publicada.
                </p>
              )}

              <div className="border-t border-white/10 pt-6">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: CAMPAIGN_COLORS[0] }}
                >
                  Horarios de oración
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {prayerSchedules.length > 0 ? (
                    prayerSchedules.map((s) => (
                      <p key={s.id} className="text-lg text-white/85">
                        {dayName(s.day_of_week)} · {formatTime(s.time_of_day)} ·{" "}
                        {prayerModality(s.name)}
                      </p>
                    ))
                  ) : (
                    <p className="text-lg text-white/85">Próximamente</p>
                  )}
                </div>
              </div>

              <div>
                <PosterButton href="/oraciones">Ver todas las oraciones →</PosterButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Próximos eventos */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Eyebrow color={CAMPAIGN_COLORS[2]}>Agenda</Eyebrow>
              <PosterHeading>Próximos eventos</PosterHeading>
              <p className={cn(hind.className, "mt-3 text-white/70")}>
                Entérate de lo que viene y encuentra un espacio para conectar,
                crecer y participar en comunidad.
              </p>
            </div>
            <TextLink href="/eventos">Ver todos los eventos</TextLink>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event, i) => {
                const c = CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length];
                const { day, month } = eventDateParts(event.eventDate);
                return (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.slug}`}
                    className="group flex flex-col overflow-hidden border border-white/10 bg-black transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-110"
                  >
                    {event.imageUrl && (
                      <div className="relative aspect-video w-full shrink-0 overflow-hidden">
                        <Image
                          src={event.imageUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-baseline gap-1.5" style={{ color: c }}>
                        <span className={cn(anton.className, "text-4xl leading-none")}>{day}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">{month}</span>
                      </div>
                      <h3
                        className={cn(
                          anton.className,
                          "mt-3 text-xl uppercase leading-tight text-white"
                        )}
                      >
                        {event.name}
                      </h3>
                      {event.description && (
                        <p className={cn(hind.className, "mt-2 line-clamp-2 text-sm text-white/60")}>
                          {event.description}
                        </p>
                      )}
                      <p className="mt-4 text-sm text-white/50">
                        {event.eventTime ? formatTime(event.eventTime) : ""}
                        {event.eventTime && event.locationName ? " · " : ""}
                        {event.locationName}
                      </p>
                      <p
                        className="mt-auto pt-5 text-sm font-bold uppercase tracking-wide"
                        style={{ color: c }}
                      >
                        {event.registrationUrl ? "Inscribirme" : "Ver más"}{" "}
                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
              <p className="text-white/50">
                Muy pronto vamos a anunciar nuevos eventos — vuelve pronto
                para no perdértelos.
              </p>
            </div>
          )}
        </Container>
      </section>

    </>
  );
}
