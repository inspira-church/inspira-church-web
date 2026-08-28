import type { Metadata } from "next";
import { LatestPrayerMoment } from "@/components/public/LatestPrayerMoment";
import { PrayerArchive } from "@/components/public/PrayerArchive";
import { PrayerRequestCTA } from "@/components/public/PrayerRequestCTA";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { formatTime, prayerModality, scheduleDayLabel } from "@/lib/format";
import { getPrayerSchedules } from "@/lib/queries/schedules";
import {
  getLatestSermonByTopic,
  getPrayerMeetingTypesInUse,
  getPublishedPrayerSermonsPage,
} from "@/lib/queries/sermons";
import { getTeamMemberById, getTeamMembersByIds } from "@/lib/queries/team-members";
import { PRAYER_TOPIC } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TITLE = "Oraciones | Inspira Church";
const DESCRIPTION =
  "Un espacio para buscar a Dios juntos, detenernos en Su presencia y hacer de la oración parte de nuestra vida. Revive nuestros encuentros de oración y comparte tu petición.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/oraciones" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/oraciones", type: "website" },
};

const PAGE_SIZE = 9;

export default async function PrayerRecordingsPage() {
  const latest = await getLatestSermonByTopic(PRAYER_TOPIC);

  const [latestPreacher, prayerSchedules, { sermons: archiveSermons, hasMore }, meetingTypesInUse] =
    await Promise.all([
      getTeamMemberById(latest?.preacher_id ?? null),
      getPrayerSchedules(),
      getPublishedPrayerSermonsPage({ limit: PAGE_SIZE, excludeId: latest?.id }),
      getPrayerMeetingTypesInUse(),
    ]);

  const preacherIds = Array.from(
    new Set(archiveSermons.map((s) => s.preacher_id).filter((id): id is string => Boolean(id)))
  );
  const preachers = await getTeamMembersByIds(preacherIds);
  const preacherById = Object.fromEntries(preachers.map((p) => [p.id, p.full_name]));

  const isEmpty = !latest && archiveSermons.length === 0;

  return (
    <>
      {/* Hero — amplio, tranquilo, contemplativo */}
      <section className="border-b border-white/10 bg-black pb-12 pt-16 sm:pb-16 sm:pt-24">
        <Container>
          <p
            className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ borderColor: ABOUT_COLORS.teal, color: ABOUT_COLORS.teal }}
          >
            Comunión
          </p>
          <h1
            className={cn(
              anton.className,
              "mt-5 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-6xl"
            )}
          >
            Oraciones
          </h1>
          <p className={cn(hind.className, "mt-5 max-w-xl text-lg text-white/70")}>
            Un espacio para buscar a Dios juntos, detenernos en Su presencia y hacer de la oración
            parte de nuestra vida.
          </p>

          {prayerSchedules.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-6">
              {prayerSchedules.map((s) => (
                <p key={s.id} className="text-sm text-white/50">
                  {scheduleDayLabel(s.day_of_week, s.recurrence, s.monthly_week)} ·{" "}
                  {formatTime(s.time_of_day)} · {prayerModality(s.name)}
                </p>
              ))}
            </div>
          )}
        </Container>
      </section>

      {latest && (
        <LatestPrayerMoment
          slug={latest.slug}
          thumbnailUrl={latest.thumbnail_url}
          sermonDate={latest.sermon_date}
          preacherName={latestPreacher?.full_name}
          meetingType={latest.meeting_type}
        />
      )}

      {isEmpty && (
        <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
          <Container>
            <p className={cn(hind.className, "text-center text-lg text-white/60")}>
              Pronto tendremos nuevos momentos para compartir.
            </p>
          </Container>
        </section>
      )}

      {/* Pausa — sin cards, sin botones, solo espacio */}
      <section className="px-6 py-24 text-center sm:px-8 sm:py-40" style={{ backgroundColor: ABOUT_COLORS.cream }}>
        <p
          className={cn(
            anton.className,
            "mx-auto max-w-2xl text-balance text-3xl uppercase leading-[1.1] text-black sm:text-5xl"
          )}
        >
          Hay momentos en los que solo necesitamos orar.
        </p>
        <p className={cn(hind.className, "mx-auto mt-6 max-w-md text-lg text-black/70")}>
          No tienes que tener todas las palabras. Solo un corazón dispuesto a acercarse a Dios.
        </p>
      </section>

      {/* Archivo — no repite la protagonista de Último encuentro (excludeId) */}
      {!isEmpty && (
        <section className="bg-black py-16 sm:py-24">
          <Container>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
              Ora con nosotros
            </p>
            <h2
              className={cn(
                anton.className,
                "mt-2 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
              )}
            >
              Vuelve a estos momentos de oración.
            </h2>

            {archiveSermons.length === 0 ? (
              <p className={cn(hind.className, "mt-10 text-white/50")}>
                Todavía no hay más grabaciones — vuelve pronto.
              </p>
            ) : (
              <div className="mt-10">
                <PrayerArchive
                  initialSermons={archiveSermons}
                  initialHasMore={hasMore}
                  excludeId={latest?.id}
                  preacherById={preacherById}
                  meetingTypesInUse={meetingTypesInUse}
                />
              </div>
            )}
          </Container>
        </section>
      )}

      <PrayerRequestCTA />
    </>
  );
}
