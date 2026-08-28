import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LazySermonVideo } from "@/components/public/LazySermonVideo";
import { SermonCard } from "@/components/public/SermonCard";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { formatDateCompact } from "@/lib/format";
import {
  getRelatedSermons,
  getSermonBySlug,
} from "@/lib/queries/sermons";
import { getSermonSeriesById } from "@/lib/queries/sermon-series";
import { getSiteUrl } from "@/lib/get-site-url";
import { getTeamMemberById, getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) return {};

  const siteUrl = await getSiteUrl();
  const description =
    sermon.description ?? `${sermon.title} — prédica de Inspira Church, ${formatDateCompact(sermon.sermon_date)}.`;

  return {
    title: `${sermon.title} | Inspira Church`,
    description,
    alternates: { canonical: `${siteUrl}/predicas/${sermon.slug}` },
    openGraph: {
      title: sermon.title,
      description,
      type: "video.other",
      url: `${siteUrl}/predicas/${sermon.slug}`,
      images: sermon.thumbnail_url ? [{ url: sermon.thumbnail_url }] : undefined,
    },
    twitter: sermon.thumbnail_url
      ? { card: "summary_large_image", title: sermon.title, description, images: [sermon.thumbnail_url] }
      : undefined,
  };
}

export default async function SermonPage({ params }: PageProps) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) notFound();

  const [preacher, series, related] = await Promise.all([
    getTeamMemberById(sermon.preacher_id),
    getSermonSeriesById(sermon.series_id),
    getRelatedSermons({
      id: sermon.id,
      seriesId: sermon.series_id,
      topics: sermon.topics ?? [],
      preacherId: sermon.preacher_id,
    }),
  ]);

  const relatedPreacherIds = Array.from(
    new Set(related.map((s) => s.preacher_id).filter((id): id is string => !!id))
  );
  const relatedPreachers = await getTeamMembersByIds(relatedPreacherIds);
  const relatedPreacherById = new Map(relatedPreachers.map((p) => [p.id, p.full_name]));

  const eyebrow = series?.name ?? sermon.topics?.[0];

  return (
    <>
      <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            {eyebrow && (
              series ? (
                <Link
                  href={`/series/${series.slug}`}
                  className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                  style={{ color: ABOUT_COLORS.coral }}
                >
                  {eyebrow}
                </Link>
              ) : (
                <p
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: ABOUT_COLORS.coral }}
                >
                  {eyebrow}
                </p>
              )
            )}
            <h1
              className={cn(
                anton.className,
                "mt-2 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl"
              )}
            >
              {sermon.title}
            </h1>
            <div className={cn(hind.className, "mt-4 flex flex-wrap items-center gap-x-3 text-white/50")}>
              {preacher && <span>{preacher.full_name}</span>}
              {preacher && <span aria-hidden="true">·</span>}
              <span>{formatDateCompact(sermon.sermon_date)}</span>
            </div>

            <div className="mt-8">
              <LazySermonVideo
                url={sermon.youtube_url}
                title={sermon.title}
                thumbnailUrl={sermon.thumbnail_url}
              />
            </div>

            {sermon.description && (
              <div className="mt-10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/45">
                  Sobre este mensaje
                </p>
                <p className={cn(hind.className, "mt-3 text-lg leading-relaxed text-white/70")}>
                  {sermon.description}
                </p>
              </div>
            )}

            {sermon.topics && sermon.topics.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {sermon.topics.map((topic: string, i: number) => (
                  <span
                    key={topic}
                    className="border px-3 py-1 text-xs font-bold uppercase tracking-widest"
                    style={{
                      borderColor: i % 2 === 0 ? ABOUT_COLORS.teal : ABOUT_COLORS.coral,
                      color: i % 2 === 0 ? ABOUT_COLORS.teal : ABOUT_COLORS.coral,
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
              Sigue creciendo
            </p>
            <h2
              className={cn(
                anton.className,
                "mt-2 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
              )}
            >
              Más mensajes para ti
            </h2>
            <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-3">
              {related.map((item) => (
                <SermonCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  thumbnailUrl={item.thumbnail_url}
                  sermonDate={item.sermon_date}
                  preacherName={item.preacher_id ? relatedPreacherById.get(item.preacher_id) : undefined}
                  topic={item.topics?.[0]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
