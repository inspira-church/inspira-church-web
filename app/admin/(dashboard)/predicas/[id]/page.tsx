import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SermonForm } from "@/components/admin/SermonForm";
import { PRAYER_TOPIC } from "@/lib/constants";
import { updateSermon } from "@/lib/actions/sermons";
import { createClient } from "@/lib/supabase/server";

export default async function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: sermon }, { data: series }, { data: preachers }] = await Promise.all([
    supabase.from("sermons").select("*").eq("id", id).single(),
    supabase.from("sermon_series").select("id, name").order("name"),
    supabase.from("team_members").select("id, full_name").order("full_name"),
  ]);

  if (!sermon) notFound();

  const updateWithId = updateSermon.bind(null, id);

  // Una grabación de oración es una prédica normal con "Oración" en Temas
  // (sin tabla propia, ver CLAUDE.md) — este mismo formulario sirve para
  // ambas, mostrando el selector de Tipo de encuentro solo cuando aplica.
  const isPrayerRecording = (sermon.topics ?? []).some(
    (t: string) => t.toLowerCase() === PRAYER_TOPIC.toLowerCase()
  );

  return (
    <div>
      <Breadcrumbs
        items={
          isPrayerRecording
            ? [{ label: "Grabaciones de oración", href: "/admin/oraciones" }, { label: "Editar grabación" }]
            : [{ label: "Prédicas", href: "/admin/predicas" }, { label: "Editar prédica" }]
        }
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">
        {isPrayerRecording ? "Editar grabación de oración" : "Editar prédica"}
      </h1>
      <div className="mt-8">
        <SermonForm
          action={updateWithId}
          seriesOptions={(series ?? []).map((s) => ({ value: s.id, label: s.name }))}
          preacherOptions={(preachers ?? []).map((p) => ({ value: p.id, label: p.full_name }))}
          showMeetingType={isPrayerRecording}
          cancelHref={isPrayerRecording ? "/admin/oraciones" : "/admin/predicas"}
          defaultValues={{
            title: sermon.title,
            slug: sermon.slug,
            seriesId: sermon.series_id,
            preacherId: sermon.preacher_id,
            description: sermon.description,
            youtubeUrl: sermon.youtube_url,
            thumbnailUrl: sermon.thumbnail_url,
            sermonDate: sermon.sermon_date,
            topics: sermon.topics ?? [],
            published: sermon.published,
            featured: sermon.featured,
            meetingType: sermon.meeting_type ?? null,
          }}
        />
      </div>
    </div>
  );
}
