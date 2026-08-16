import Link from "next/link";
import { EventCard } from "@/components/public/EventCard";
import { GroupCard } from "@/components/public/GroupCard";
import { SermonCard } from "@/components/public/SermonCard";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatTime } from "@/lib/format";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { getPublishedEvents } from "@/lib/queries/events";
import { getActiveSchedules } from "@/lib/queries/schedules";
import { getFeaturedSermon } from "@/lib/queries/sermons";
import { getSermonSeriesById } from "@/lib/queries/sermon-series";
import { getSiteSettings } from "@/lib/queries/settings";
import { getTeamMemberById } from "@/lib/queries/team-members";
import { getCurrentLiveVideo } from "@/lib/youtube";

export default async function HomePage() {
  const featuredSermon = await getFeaturedSermon();
  const [featuredSeries, featuredPreacher, schedules, growthGroups, events, settings] =
    await Promise.all([
      getSermonSeriesById(featuredSermon?.series_id ?? null),
      getTeamMemberById(featuredSermon?.preacher_id ?? null),
      getActiveSchedules(),
      getPublicGroups(),
      getPublishedEvents(),
      getSiteSettings(),
    ]);
  const liveVideo = await getCurrentLiveVideo(settings.youtubeChannelId || null);

  const upcomingEvents = events
    .filter((e) => e.status === "proximo")
    .slice(0, 3);

  const sundayServices = schedules.filter(
    (s) => s.type === "servicio" && s.day_of_week === 0
  );

  const featuredGroups = growthGroups.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Section className="pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Bienvenido a Inspira Church
          </p>
          <h1 className="mt-3 text-balance font-display text-5xl font-semibold text-ink sm:text-6xl">
            Una comunidad que te inspira a crecer
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            Somos una iglesia cercana y familiar en Bogotá. Sea cual sea tu
            historia, hay un lugar para ti aquí — en un servicio, en un
            grupo de crecimiento o en una conversación.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} href="/contacto" size="lg">
              Visítanos
            </Button>
            <Button as={Link} href="/predicas" variant="secondary" size="lg">
              Ver prédicas
            </Button>
            <Button as={Link} href="/grupos" variant="ghost" size="lg">
              Encontrar un grupo
            </Button>
          </div>
          <div className="mt-6">
            <WhatsAppButton
              variant="inline"
              message={settings.whatsappMessage}
              number={settings.whatsappNumber}
            />
          </div>
        </div>
      </Section>

      {/* En vivo — solo aparece mientras el canal está transmitiendo */}
      {liveVideo && (
        <Section tone="raised">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              En vivo
            </span>
            <p className="font-display text-2xl font-semibold text-ink">{liveVideo.title}</p>
          </div>
          <div className="mt-6 max-w-3xl">
            <YouTubeEmbed
              url={`https://www.youtube.com/watch?v=${liveVideo.videoId}`}
              title={liveVideo.title}
            />
          </div>
        </Section>
      )}

      {/* Próximo servicio / horarios */}
      <Section tone="raised">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            eyebrow="Próximo servicio"
            title="Te esperamos este domingo"
            className="max-w-xl"
          />
          <div className="flex flex-wrap gap-4">
            {sundayServices.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-paper px-5 py-4"
              >
                <p className="font-display text-2xl font-semibold text-ink">
                  {formatTime(s.time_of_day)}
                </p>
                <p className="text-sm text-ink-faint">{s.location}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Predicación destacada */}
      {featuredSermon && (
        <Section>
          <SectionHeading eyebrow="Predicación destacada" title="Lo último" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <SermonCard
              slug={featuredSermon.slug}
              title={featuredSermon.title}
              thumbnailUrl={featuredSermon.thumbnail_url}
              sermonDate={featuredSermon.sermon_date}
              preacherName={featuredPreacher?.full_name}
              seriesName={featuredSeries?.name}
            />
            <div className="flex flex-col justify-center">
              {featuredSermon.description && (
                <p className="text-ink-soft">{featuredSermon.description}</p>
              )}
              <div className="mt-4">
                <Button as={Link} href="/predicas" variant="secondary">
                  Ver todas las prédicas
                </Button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Próximos eventos */}
      <Section tone="raised">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Agenda" title="Próximos eventos" />
          <Link
            href="/eventos"
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todos los eventos →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
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

      {/* Grupos de crecimiento */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Comunidad"
            title="Grupos de crecimiento"
            description="Reuniones pequeñas en distintos sectores de la ciudad — el lugar más rápido para hacer amigos de verdad."
          />
          <Link
            href="/grupos"
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todos los grupos →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGroups.map((group) => (
            <GroupCard
              key={group.id}
              slug={group.slug}
              name={group.name}
              groupType={group.groupType}
              dayOfWeek={group.dayOfWeek}
              timeOfDay={group.timeOfDay}
              locality={group.locality}
              sector={group.sector}
              leaderFullName={group.leaderFullName}
            />
          ))}
        </div>
      </Section>

      {/* Info breve */}
      <Section tone="raised">
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="Quiénes somos"
            title="Más que un servicio de domingo"
            description="Inspira Church nació con el deseo de ser una comunidad cercana y familiar, donde cada persona pueda crecer en su fe, encontrar propósito y servir a los demás."
          />
          <div className="mt-6">
            <Button as={Link} href="/nosotros" variant="secondary">
              Conócenos
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
