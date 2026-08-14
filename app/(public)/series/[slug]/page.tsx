import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SermonCard } from "@/components/public/SermonCard";
import { Section } from "@/components/ui/Section";
import { getSermonSeriesBySlug } from "@/lib/queries/sermon-series";
import { getSermonsBySeriesId } from "@/lib/queries/sermons";
import { getTeamMembersByIds } from "@/lib/queries/team-members";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSermonSeriesBySlug(slug);
  if (!series) return {};
  return {
    title: `${series.name} | Inspira Church`,
    description: series.description ?? undefined,
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getSermonSeriesBySlug(slug);
  if (!series) notFound();

  const relatedSermons = await getSermonsBySeriesId(series.id);
  const preacherIds = Array.from(
    new Set(relatedSermons.map((s) => s.preacher_id).filter((id): id is string => !!id))
  );
  const preachers = await getTeamMembersByIds(preacherIds);
  const preacherById = new Map(preachers.map((p) => [p.id, p]));

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <div className="grid gap-8 sm:grid-cols-[280px_1fr] sm:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-paper-raised">
            {series.cover_image_url && (
              <Image
                src={series.cover_image_url}
                alt=""
                fill
                className="object-cover"
                sizes="280px"
              />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Serie
            </p>
            <h1 className="mt-2 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
              {series.name}
            </h1>
            {series.description && (
              <p className="mt-4 text-lg text-ink-soft">{series.description}</p>
            )}
          </div>
        </div>
      </Section>

      <Section tone="raised">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Prédicas de esta serie
        </h2>
        {relatedSermons.length === 0 ? (
          <p className="mt-8 text-ink-soft">Todavía no hay prédicas en esta serie.</p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedSermons.map((sermon) => (
              <SermonCard
                key={sermon.id}
                slug={sermon.slug}
                title={sermon.title}
                thumbnailUrl={sermon.thumbnail_url}
                sermonDate={sermon.sermon_date}
                preacherName={preacherById.get(sermon.preacher_id ?? "")?.full_name}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
