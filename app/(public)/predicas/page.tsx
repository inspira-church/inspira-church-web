import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { SermonFilters } from "@/components/public/SermonFilters";
import { SermonCard } from "@/components/public/SermonCard";
import { Container } from "@/components/ui/Container";
import { hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { PRAYER_TOPIC } from "@/lib/constants";
import {
  getPreacherIdsWithPublishedSermons,
  getPublishedSermons,
  getPublishedTopics,
} from "@/lib/queries/sermons";
import { getActiveSermonSeries } from "@/lib/queries/sermon-series";
import { getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prédicas | Inspira Church",
  description: "Explora las prédicas de Inspira Church por predicador, serie o tema.",
};

/** Prédicas hereda el color que Inicio ya le asocia en "Tres pasos" (paso 3 → /predicas). */
const PAGE_COLOR = CAMPAIGN_COLORS[4];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ predicador?: string; serie?: string; tema?: string }>;
}) {
  const { predicador, serie, tema } = await searchParams;

  const [allSermons, seriesList, topics, preacherIds] = await Promise.all([
    getPublishedSermons({ preacherId: predicador, seriesId: serie, topic: tema }),
    getActiveSermonSeries(),
    getPublishedTopics(),
    getPreacherIdsWithPublishedSermons(),
  ]);

  // Las grabaciones de oración tienen su propia página (/oraciones) — no se
  // mezclan con las prédicas normales, aunque coincidan con otros filtros.
  const normalizedPrayerTopic = PRAYER_TOPIC.toLowerCase();
  const sermons = allSermons.filter(
    (sermon) =>
      !(sermon.topics ?? []).some((t: string) => t.trim().toLowerCase() === normalizedPrayerTopic)
  );

  const preachers = await getTeamMembersByIds(preacherIds);

  const preacherOptions = preachers.map((p) => ({ value: p.id, label: p.full_name }));
  const seriesOptions = seriesList.map((s) => ({ value: s.id, label: s.name }));
  const topicOptions = topics.map((t) => ({ value: t, label: capitalize(t) }));

  const seriesById = new Map(seriesList.map((s) => [s.id, s]));
  const preacherById = new Map(preachers.map((p) => [p.id, p]));

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={PAGE_COLOR}>Enseñanza</Eyebrow>
          <PosterHeading>Prédicas</PosterHeading>
          <p className={cn(hind.className, "mt-4 max-w-xl text-white/70")}>
            Todas nuestras prédicas, organizadas por serie, predicador y tema.
          </p>
        </Container>
      </section>

      <section className="bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <SermonFilters preachers={preacherOptions} series={seriesOptions} topics={topicOptions} />

          {sermons.length === 0 ? (
            <div className="mt-10 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
              <p className="text-white/50">
                No encontramos prédicas con esos filtros. Prueba quitando alguno.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((sermon, i) => (
                <SermonCard
                  key={sermon.id}
                  slug={sermon.slug}
                  title={sermon.title}
                  thumbnailUrl={sermon.thumbnail_url}
                  sermonDate={sermon.sermon_date}
                  preacherName={preacherById.get(sermon.preacher_id ?? "")?.full_name}
                  seriesName={seriesById.get(sermon.series_id ?? "")?.name}
                  accentColor={CAMPAIGN_COLORS[(i + 4) % CAMPAIGN_COLORS.length]}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
