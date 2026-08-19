import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SermonCard } from "@/components/public/SermonCard";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { getSermonSeriesBySlug } from "@/lib/queries/sermon-series";
import { getSermonsBySeriesId } from "@/lib/queries/sermons";
import { getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSermonSeriesBySlug(slug);
  if (!series) return {};
  return {
    title: `${series.name} | Inspira Church`,
    description: series.description ?? `Prédicas de la serie ${series.name} en Inspira Church.`,
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
  const preacherById = new Map(preachers.map((p) => [p.id, p.full_name]));

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-black">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {series.cover_image_url ? (
            <Image src={series.cover_image_url} alt="" fill priority className="object-cover" sizes="100vw" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(120% 100% at 50% 20%, ${ABOUT_COLORS.teal}55 0%, #0a0a0a 75%)`,
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.92) 100%)",
            }}
          />
        </div>

        <Container className="py-20 text-center sm:py-28">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: ABOUT_COLORS.coral }}
          >
            Serie
          </p>
          <h1
            className={cn(
              anton.className,
              "mx-auto mt-3 max-w-2xl text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl"
            )}
          >
            {series.name}
          </h1>
          {series.description && (
            <p className={cn(hind.className, "mx-auto mt-5 max-w-xl text-lg text-white/75")}>
              {series.description}
            </p>
          )}
        </Container>
      </section>

      <section className="bg-black py-16 sm:py-24">
        <Container>
          <p className="text-xs font-bold uppercase tracking-widest text-white/45">
            {relatedSermons.length} {relatedSermons.length === 1 ? "mensaje" : "mensajes"} en esta
            serie
          </p>

          {relatedSermons.length === 0 ? (
            <p className={cn(hind.className, "mt-8 text-white/60")}>
              Todavía no hay prédicas publicadas en esta serie.
            </p>
          ) : (
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSermons.map((sermon) => (
                <SermonCard
                  key={sermon.id}
                  slug={sermon.slug}
                  title={sermon.title}
                  thumbnailUrl={sermon.thumbnail_url}
                  sermonDate={sermon.sermon_date}
                  preacherName={sermon.preacher_id ? preacherById.get(sermon.preacher_id) : undefined}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
