import type { Metadata } from "next";
import { Eyebrow } from "@/components/public/cartel";
import { LatestSermon } from "@/components/public/LatestSermon";
import { SermonSeriesShowcase } from "@/components/public/SermonSeriesShowcase";
import { SermonsClosingCTA } from "@/components/public/SermonsClosingCTA";
import { SermonsExplore } from "@/components/public/SermonsExplore";
import { SermonsList } from "@/components/public/SermonsList";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import {
  getLatestSermon,
  getPreacherIdsWithPublishedSermons,
  getPublishedSermonCountsBySeriesId,
  getPublishedSermonsPage,
  getPublishedTopics,
} from "@/lib/queries/sermons";
import { getActiveSermonSeries } from "@/lib/queries/sermon-series";
import { getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prédicas | Inspira Church",
  description:
    "Mensajes para crecer en la fe, conocer más a Jesús y llevar Su Palabra a nuestra vida diaria.",
};

const PAGE_SIZE = 9;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ predicador?: string; serie?: string; tema?: string; q?: string }>;
}) {
  const { predicador, serie, tema, q } = await searchParams;
  const filters = { preacherId: predicador, seriesId: serie, topic: tema, search: q };

  const [latest, { sermons: initialSermons, hasMore }, seriesList, seriesCounts, topics, preacherIds] =
    await Promise.all([
      getLatestSermon(),
      getPublishedSermonsPage(filters, { limit: PAGE_SIZE }),
      getActiveSermonSeries(),
      getPublishedSermonCountsBySeriesId(),
      getPublishedTopics(),
      getPreacherIdsWithPublishedSermons(),
    ]);

  const preachers = await getTeamMembersByIds(preacherIds);

  const preacherOptions = preachers.map((p) => ({ value: p.id, label: p.full_name }));
  const seriesOptions = seriesList.map((s) => ({ value: s.id, label: s.name }));
  const topicOptions = topics.map((t) => ({ value: t, label: capitalize(t) }));

  const seriesById = Object.fromEntries(seriesList.map((s) => [s.id, s.name]));
  const preacherById = Object.fromEntries(preachers.map((p) => [p.id, p.full_name]));

  const latestPreacher = latest?.preacher_id ? preacherById[latest.preacher_id] : undefined;
  const latestSeries = latest?.series_id ? seriesById[latest.series_id] : undefined;

  const filterKey = JSON.stringify(filters);

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={ABOUT_COLORS.coral}>Enseñanza</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
            )}
          >
            Prédicas
          </h1>
          <p className={cn(hind.className, "mt-4 max-w-xl text-lg text-white/70")}>
            Mensajes para crecer en la fe, conocer más a Jesús y llevar Su Palabra a nuestra vida
            diaria.
          </p>
        </Container>
      </section>

      {latest && (
        <LatestSermon
          slug={latest.slug}
          title={latest.title}
          thumbnailUrl={latest.thumbnail_url}
          sermonDate={latest.sermon_date}
          preacherName={latestPreacher}
          seriesName={latestSeries}
          topic={latest.topics?.[0]}
        />
      )}

      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <SermonsExplore preachers={preacherOptions} series={seriesOptions} topics={topicOptions} />

          <SermonsList
            key={filterKey}
            initialSermons={initialSermons}
            initialHasMore={hasMore}
            filters={filters}
            seriesById={seriesById}
            preacherById={preacherById}
          />
        </Container>
      </section>

      <SermonSeriesShowcase
        series={seriesList.map((s) => ({ ...s, count: seriesCounts[s.id] ?? 0 }))}
      />

      <SermonsClosingCTA />
    </>
  );
}
