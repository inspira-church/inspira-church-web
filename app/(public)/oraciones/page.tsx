import type { Metadata } from "next";
import { SermonCard } from "@/components/public/SermonCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PRAYER_TOPIC } from "@/lib/constants";
import { getPublishedSermonsByTopic } from "@/lib/queries/sermons";
import { getTeamMembersByIds } from "@/lib/queries/team-members";

export const metadata: Metadata = {
  title: "Oraciones | Inspira Church",
  description: "Grabaciones de nuestras noches de oración presencial y virtual.",
};

export default async function PrayerRecordingsPage() {
  const sermons = await getPublishedSermonsByTopic(PRAYER_TOPIC);
  const preacherIds = Array.from(
    new Set(sermons.map((s) => s.preacher_id).filter((id): id is string => Boolean(id)))
  );
  const preachers = await getTeamMembersByIds(preacherIds);
  const preacherById = new Map(preachers.map((p) => [p.id, p]));

  return (
    <Section className="pt-16 sm:pt-24">
      <SectionHeading
        as="h1"
        eyebrow="Comunión"
        title="Oraciones"
        description="Revive las grabaciones de nuestras noches de oración, presenciales y virtuales."
      />

      {sermons.length === 0 ? (
        <p className="mt-16 text-ink-soft">
          Todavía no hay grabaciones de oración publicadas.
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
            />
          ))}
        </div>
      )}
    </Section>
  );
}
