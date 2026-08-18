import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { SermonCard } from "@/components/public/SermonCard";
import { Container } from "@/components/ui/Container";
import { hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { PRAYER_TOPIC } from "@/lib/constants";
import { getPublishedSermonsByTopic } from "@/lib/queries/sermons";
import { getTeamMembersByIds } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Oraciones | Inspira Church",
  description: "Grabaciones de nuestras noches de oración presencial y virtual.",
};

/** Oraciones hereda el color que Inicio ya le asocia en su sección "Ora con nosotros". */
const PAGE_COLOR = CAMPAIGN_COLORS[0];

export default async function PrayerRecordingsPage() {
  const sermons = await getPublishedSermonsByTopic(PRAYER_TOPIC);
  const preacherIds = Array.from(
    new Set(sermons.map((s) => s.preacher_id).filter((id): id is string => Boolean(id)))
  );
  const preachers = await getTeamMembersByIds(preacherIds);
  const preacherById = new Map(preachers.map((p) => [p.id, p]));

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={PAGE_COLOR}>Comunión</Eyebrow>
          <PosterHeading>Oraciones</PosterHeading>
          <p className={cn(hind.className, "mt-4 max-w-xl text-white/70")}>
            Revive las grabaciones de nuestras noches de oración, presenciales y virtuales.
          </p>
        </Container>
      </section>

      <section className="bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          {sermons.length === 0 ? (
            <div className="border border-dashed border-white/15 bg-black px-8 py-14 text-center">
              <p className="text-white/50">Todavía no hay grabaciones de oración publicadas.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((sermon, i) => (
                <SermonCard
                  key={sermon.id}
                  slug={sermon.slug}
                  title={sermon.title}
                  thumbnailUrl={sermon.thumbnail_url}
                  sermonDate={sermon.sermon_date}
                  preacherName={preacherById.get(sermon.preacher_id ?? "")?.full_name}
                  accentColor={CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length]}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
