import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { formatDate } from "@/lib/format";
import { getSermonBySlug } from "@/lib/queries/sermons";
import { getSermonSeriesById } from "@/lib/queries/sermon-series";
import { getTeamMemberById } from "@/lib/queries/team-members";

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
    <Section className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-3xl">
        {series && (
          <Link
            href={`/series/${series.slug}`}
            className="text-sm font-semibold uppercase tracking-wide text-accent hover:underline"
          >
            {series.name}
          </Link>
        )}
        <h1 className="mt-2 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
          {sermon.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-faint">
          {preacher && <span>{preacher.full_name}</span>}
          <span>·</span>
          <span>{formatDate(sermon.sermon_date)}</span>
        </div>

        <div className="mt-8">
          <YouTubeEmbed url={sermon.youtube_url} title={sermon.title} />
        </div>

        {sermon.description && (
          <p className="mt-8 text-lg text-ink-soft">{sermon.description}</p>
        )}

        {sermon.topics && sermon.topics.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {sermon.topics.map((topic: string) => (
              <Badge key={topic}>{topic}</Badge>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
