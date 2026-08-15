import type { Metadata } from "next";
import { SermonFilters } from "@/components/public/SermonFilters";
import { SermonCard } from "@/components/public/SermonCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getPreacherIdsWithPublishedSermons,
  getPublishedSermons,
  getPublishedTopics,
} from "@/lib/queries/sermons";
import { getActiveSermonSeries } from "@/lib/queries/sermon-series";
import { getTeamMembersByIds } from "@/lib/queries/team-members";

export const metadata: Metadata = {
  title: "Prédicas | Inspira Church",
  description: "Explora las prédicas de Inspira Church por predicador, serie o tema.",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ predicador?: string; serie?: string; tema?: string }>;
}) {
  const { predicador, serie, tema } = await searchParams;

  const [sermons, seriesList, topics, preacherIds] = await Promise.all([
    getPublishedSermons({ preacherId: predicador, seriesId: serie, topic: tema }),
    getActiveSermonSeries(),
    getPublishedTopics(),
    getPreacherIdsWithPublishedSermons(),
  ]);

  const preachers = await getTeamMembersByIds(preacherIds);

  const preacherOptions = preachers.map((p) => ({ value: p.id, label: p.full_name }));
  const seriesOptions = seriesList.map((s) => ({ value: s.id, label: s.name }));
  const topicOptions = topics.map((t) => ({ value: t, label: capitalize(t) }));

  const seriesById = new Map(seriesList.map((s) => [s.id, s]));
  const preacherById = new Map(preachers.map((p) => [p.id, p]));

  return (
    <Section className="pt-16 sm:pt-24">
      <SectionHeading
        as="h1"
        eyebrow="Enseñanza"
        title="Prédicas"
        description="Todas nuestras prédicas, organizadas por serie, predicador y tema."
      />

      <div className="mt-8">
        <SermonFilters
          preachers={preacherOptions}
          series={seriesOptions}
          topics={topicOptions}
        />
      </div>

      {sermons.length === 0 ? (
        <p className="mt-16 text-ink-soft">
          No encontramos prédicas con esos filtros. Prueba quitando alguno.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((sermon) => (
            <SermonCard
              key={sermon.id}
              slug={sermon.slug}
              title={sermon.title}
              thumbnailUrl={sermon.thumbnail_url}
              sermonDate={sermon.sermon_date}
              preacherName={preacherById.get(sermon.preacher_id ?? "")?.full_name}
              seriesName={seriesById.get(sermon.series_id ?? "")?.name}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
