import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LazySermonVideo } from "@/components/public/LazySermonVideo";
import { PrayerCard } from "@/components/public/PrayerCard";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { dayName, dayNameFromDate, formatDate, formatTime, prayerModality } from "@/lib/format";
import { getPrayerSchedules } from "@/lib/queries/schedules";
import { getPrayerSermonBySlug, getRelatedPrayerSermons } from "@/lib/queries/sermons";
import { getSiteUrl } from "@/lib/get-site-url";
import { getTeamMemberById, getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const MEETING_TYPE_LABEL: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getPrayerSermonBySlug(slug);
  if (!sermon) return {};

  const siteUrl = await getSiteUrl();
  const title = `Oración · ${dayNameFromDate(sermon.sermon_date)} ${formatDate(sermon.sermon_date)} | Inspira Church`;
  const description =
    sermon.description ??
    `Revive este encuentro de oración de Inspira Church, ${formatDate(sermon.sermon_date)}.`;

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/oraciones/${sermon.slug}` },
    openGraph: {
      title,
      description,
      type: "video.other",
      url: `${siteUrl}/oraciones/${sermon.slug}`,
      images: sermon.thumbnail_url ? [{ url: sermon.thumbnail_url }] : undefined,
    },
  };
}

export default async function PrayerRecordingPage({ params }: PageProps) {
  const { slug } = await params;
  const sermon = await getPrayerSermonBySlug(slug);
  if (!sermon) notFound();

  const [preacher, prayerSchedules, related] = await Promise.all([
    getTeamMemberById(sermon.preacher_id),
    getPrayerSchedules(),
    getRelatedPrayerSermons(sermon.id, sermon.meeting_type, 3),
  ]);

  const relatedPreacherIds = Array.from(
    new Set(related.map((s) => s.preacher_id).filter((id): id is string => !!id))
  );
  const relatedPreachers = await getTeamMembersByIds(relatedPreacherIds);
  const relatedPreacherById = Object.fromEntries(relatedPreachers.map((p) => [p.id, p.full_name]));

  const meetingLabel = sermon.meeting_type ? MEETING_TYPE_LABEL[sermon.meeting_type] : undefined;

  return (
    <>
      <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: ABOUT_COLORS.teal }}
            >
              Oración{meetingLabel ? ` · ${meetingLabel}` : ""}
            </p>
            <h1
              className={cn(
                anton.className,
                "mt-2 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl"
              )}
            >
              <span className="block">{dayNameFromDate(sermon.sermon_date)}</span>
              <span className="block">{formatDate(sermon.sermon_date)}</span>
            </h1>
            {preacher && (
              <p className={cn(hind.className, "mt-4 text-white/50")}>{preacher.full_name}</p>
            )}

            <div className="mt-8">
              <LazySermonVideo
                url={sermon.youtube_url}
                title={`oración del ${formatDate(sermon.sermon_date)}`}
                thumbnailUrl={sermon.thumbnail_url}
              />
            </div>

            {sermon.description && (
              <p className={cn(hind.className, "mt-8 text-lg leading-relaxed text-white/70")}>
                {sermon.description}
              </p>
            )}

            {prayerSchedules.length > 0 && (
              <div className="mt-12 border-t border-white/10 pt-8">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: ABOUT_COLORS.coral }}
                >
                  Ora con nosotros
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {prayerSchedules.map((s) => (
                    <p key={s.id} className="text-lg text-white/85">
                      {dayName(s.day_of_week)} · {formatTime(s.time_of_day)} · {prayerModality(s.name)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
              Otros momentos de oración
            </p>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-3">
              {related.map((item) => (
                <PrayerCard
                  key={item.id}
                  slug={item.slug}
                  thumbnailUrl={item.thumbnail_url}
                  sermonDate={item.sermon_date}
                  preacherName={item.preacher_id ? relatedPreacherById[item.preacher_id] : undefined}
                  meetingType={item.meeting_type}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
