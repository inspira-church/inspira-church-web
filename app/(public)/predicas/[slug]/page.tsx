import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { Container } from "@/components/ui/Container";
import { anton, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { formatDate } from "@/lib/format";
import { getSermonBySlug } from "@/lib/queries/sermons";
import { getSermonSeriesById } from "@/lib/queries/sermon-series";
import { getTeamMemberById } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) return {};
  return {
    title: `${sermon.title} | Inspira Church`,
    description: sermon.description ?? undefined,
  };
}

export default async function SermonPage({ params }: PageProps) {
  const { slug } = await params;
  const sermon = await getSermonBySlug(slug);
  if (!sermon) notFound();

  const [preacher, series] = await Promise.all([
    getTeamMemberById(sermon.preacher_id),
    getSermonSeriesById(sermon.series_id),
  ]);

  return (
    <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          {series && (
            <Link
              href={`/series/${series.slug}`}
              className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
              style={{ color: CAMPAIGN_COLORS[4] }}
            >
              {series.name}
            </Link>
          )}
          <h1 className={cn(anton.className, "mt-2 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl")}>
            {sermon.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/50">
            {preacher && <span>{preacher.full_name}</span>}
            <span>·</span>
            <span>{formatDate(sermon.sermon_date)}</span>
          </div>

          <div className="mt-8">
            <YouTubeEmbed url={sermon.youtube_url} title={sermon.title} />
          </div>

          {sermon.description && (
            <p className={cn(hind.className, "mt-8 text-lg text-white/70")}>{sermon.description}</p>
          )}

          {sermon.topics && sermon.topics.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {sermon.topics.map((topic: string, i: number) => (
                <span
                  key={topic}
                  className="border px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    borderColor: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length],
                    color: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length],
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
  );
}
