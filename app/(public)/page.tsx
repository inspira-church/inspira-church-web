import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Hero } from "@/components/public/Hero";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { Container } from "@/components/ui/Container";
import { dayName, formatDate, formatDateShort, formatTime } from "@/lib/format";
import { anton, caveat, CAMPAIGN_COLORS } from "@/lib/fonts";
import { SITE_CONFIG } from "@/lib/constants";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { getPublishedEvents } from "@/lib/queries/events";
import { getHeroSlides } from "@/lib/queries/media";
import { getActiveSchedules } from "@/lib/queries/schedules";
import { getFeaturedSermon } from "@/lib/queries/sermons";
import { getSermonSeriesById } from "@/lib/queries/sermon-series";
import { getSiteSettings } from "@/lib/queries/settings";
import { getTeamMemberById } from "@/lib/queries/team-members";
import { getCurrentLiveVideo } from "@/lib/youtube";
import { cn } from "@/lib/utils";

/**
 * Todo Inicio usa el lenguaje de cartel real de @inspira.church (negro,
 * Anton, script Caveat, color de campaña rotativo) — ver Hero.tsx. Las
 * demás páginas (Nosotros, Prédicas, Grupos, Eventos, Contacto) y el panel
 * admin siguen con el sistema de diseño original en globals.css, sin
 * cambios. Por eso este archivo no reutiliza SermonCard/EventCard/GroupCard
 * (esos siguen tal cual para sus páginas propias) sino que arma tarjetas
 * propias, solo para Inicio.
 */

function Eyebrow({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p
      className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
      style={{ borderColor: color, color }}
    >
      {children}
    </p>
  );
}

function PosterHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className={cn(
        anton.className,
        "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
      )}
    >
      {children}
    </h2>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
    >
      {children} →
    </Link>
  );
}

function PosterButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border-2 border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white"
    >
      {children}
    </Link>
  );
}

export default async function HomePage() {
  const featuredSermon = await getFeaturedSermon();
  const [featuredSeries, featuredPreacher, schedules, growthGroups, events, settings, heroSlides] =
    await Promise.all([
      getSermonSeriesById(featuredSermon?.series_id ?? null),
      getTeamMemberById(featuredSermon?.preacher_id ?? null),
      getActiveSchedules(),
      getPublicGroups(),
      getPublishedEvents(),
      getSiteSettings(),
      getHeroSlides(),
    ]);
  const liveVideo = await getCurrentLiveVideo(settings.youtubeChannelId || null);

  const upcomingEvents = events
    .filter((e) => e.status === "proximo")
    .slice(0, 3);

  const featuredGroups = growthGroups.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Hero slides={heroSlides} texts={[settings.heroText1, settings.heroText2]} />

      {/* Bienvenida */}
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[0]}>Bienvenido a Inspira Church</Eyebrow>
          <PosterHeading>
            Una comunidad que
            <span className="block" style={{ color: CAMPAIGN_COLORS[0] }}>
              te inspira a crecer
            </span>
          </PosterHeading>

          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((s) => (
              <div key={s.id}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                  {s.name}
                </p>
                <p className="mt-1 text-lg text-white/85">
                  {dayName(s.day_of_week)}, {formatTime(s.time_of_day)}
                </p>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                Sede Bogotá
              </p>
              <p className="mt-1 text-lg text-white/85">
                {settings.churchAddress || SITE_CONFIG.city}
              </p>
            </div>
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
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[4]}>Por dónde empezar</Eyebrow>
          <PosterHeading>Elige tu camino</PosterHeading>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link
              href="/contacto"
              className="group block p-10 transition-opacity hover:opacity-90"
              style={{ backgroundColor: `${CAMPAIGN_COLORS[4]}4d` }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: CAMPAIGN_COLORS[4] }}
              >
                Primera vez
              </p>
              <p
                className={cn(
                  anton.className,
                  "mt-2 text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
                )}
              >
                Visito por primera vez
              </p>
              <p
                className={cn(caveat.className, "mt-5 -rotate-1 text-2xl")}
                style={{ color: CAMPAIGN_COLORS[4] }}
              >
                sin compromiso, solo para conocernos
              </p>
              <p
                className="mt-6 text-sm font-bold uppercase tracking-wide"
                style={{ color: CAMPAIGN_COLORS[4] }}
              >
                Empezar aquí{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>

            <Link
              href="/grupos"
              className="group block p-10 transition-opacity hover:opacity-90"
              style={{ backgroundColor: `${CAMPAIGN_COLORS[1]}4d` }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: CAMPAIGN_COLORS[1] }}
              >
                Ya soy parte
              </p>
              <p
                className={cn(
                  anton.className,
                  "mt-2 text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
                )}
              >
                Ya soy parte de Inspira
              </p>
              <p
                className={cn(caveat.className, "mt-5 -rotate-1 text-2xl")}
                style={{ color: CAMPAIGN_COLORS[1] }}
              >
                grupo, prédica y oración
              </p>
              <p
                className="mt-6 text-sm font-bold uppercase tracking-wide"
                style={{ color: CAMPAIGN_COLORS[1] }}
              >
                Continuar{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>
          </div>
        </Container>
      </section>

      {/* Predicación destacada */}
      {featuredSermon && (
        <section className="border-b border-white/10 bg-black py-16 sm:py-24">
          <Container>
            <Eyebrow color={CAMPAIGN_COLORS[0]}>Predicación destacada</Eyebrow>
            <PosterHeading>Lo último</PosterHeading>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <Link
                href={`/predicas/${featuredSermon.slug}`}
                className="group relative block aspect-video overflow-hidden border border-white/10 bg-[#0d0d0d]"
              >
                {featuredSermon.thumbnail_url && (
                  <Image
                    src={featuredSermon.thumbnail_url}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: CAMPAIGN_COLORS[0] }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {featuredSeries?.name && (
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: CAMPAIGN_COLORS[0] }}
                    >
                      {featuredSeries.name}
                    </p>
                  )}
                  <h3 className={cn(anton.className, "mt-1 text-2xl uppercase leading-tight text-white")}>
                    {featuredSermon.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/60">
                    {featuredPreacher?.full_name ? `${featuredPreacher.full_name} · ` : ""}
                    {formatDate(featuredSermon.sermon_date)}
                  </p>
                </div>
              </Link>

              <div className="flex flex-col justify-center">
                {featuredSermon.description && (
                  <p className="text-white/70">{featuredSermon.description}</p>
                )}
                <div className="mt-6">
                  <PosterButton href="/predicas">Ver todas las prédicas</PosterButton>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Próximos eventos */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow color={CAMPAIGN_COLORS[2]}>Agenda</Eyebrow>
              <PosterHeading>Próximos eventos</PosterHeading>
            </div>
            <TextLink href="/eventos">Ver todos los eventos</TextLink>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event, i) => {
              const c = CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length];
              return (
                <Link
                  key={event.id}
                  href={`/eventos/${event.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden border border-white/10 bg-black"
                >
                  {event.imageUrl && (
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
                  <span className="absolute inset-x-0 top-0 h-1" style={{ background: c }} aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: c }}>
                      {formatDateShort(event.eventDate)}
                      {event.eventTime ? ` · ${formatTime(event.eventTime)}` : ""}
                    </p>
                    <h3 className={cn(anton.className, "mt-1 text-xl uppercase leading-tight text-white")}>
                      {event.name}
                    </h3>
                    {event.locationName && (
                      <p className="mt-1 text-sm text-white/60">{event.locationName}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Grupos de crecimiento */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow color={CAMPAIGN_COLORS[3]}>Comunidad</Eyebrow>
              <PosterHeading>Grupos de crecimiento</PosterHeading>
              <p className="mt-3 max-w-md text-white/60">
                Reuniones pequeñas en distintos sectores de la ciudad — el
                lugar más rápido para hacer amigos de verdad.
              </p>
            </div>
            <TextLink href="/grupos">Ver todos los grupos</TextLink>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredGroups.map((group, i) => {
              const c = CAMPAIGN_COLORS[(i + 3) % CAMPAIGN_COLORS.length];
              const place = [group.sector, group.locality].filter(Boolean).join(", ");
              return (
                <Link
                  key={group.id}
                  href={`/grupos/${group.slug}`}
                  className="group relative flex min-h-[13rem] flex-col justify-between overflow-hidden border border-white/10 bg-[#0d0d0d] p-6"
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-15"
                    style={{ background: c }}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <h3 className={cn(anton.className, "text-xl uppercase leading-tight text-white")}>
                      {group.name}
                    </h3>
                    <span
                      className="shrink-0 border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ borderColor: c, color: c }}
                    >
                      {group.groupType}
                    </span>
                  </div>
                  <div className="relative">
                    {place && <p className="text-sm text-white/60">{place}</p>}
                    <p className="mt-2 text-sm font-semibold text-white">
                      {dayName(group.dayOfWeek)} · {formatTime(group.timeOfDay)}
                    </p>
                    {group.leaderFullName && (
                      <p className="mt-1 text-sm text-white/50">Lidera {group.leaderFullName}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Info breve */}
      <section className="bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow color={CAMPAIGN_COLORS[4]}>Quiénes somos</Eyebrow>
            <PosterHeading>Más que un servicio de domingo</PosterHeading>
            <p className={cn(caveat.className, "mt-2 -rotate-1 text-3xl text-[#23d3d9]")}>
              somos familia, no solo domingo
            </p>
            <p className="mt-5 text-white/70">
              Inspira Church nació con el deseo de ser una comunidad cercana
              y familiar, donde cada persona pueda crecer en su fe, encontrar
              propósito y servir a los demás.
            </p>
            <div className="mt-6">
              <PosterButton href="/nosotros">Conócenos</PosterButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
