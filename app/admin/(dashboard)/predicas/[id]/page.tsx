import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SermonForm } from "@/components/admin/SermonForm";
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

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Prédicas", href: "/admin/predicas" }, { label: "Editar prédica" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Editar prédica</h1>
      <div className="mt-8">
        <SermonForm
          action={updateWithId}
          seriesOptions={(series ?? []).map((s) => ({ value: s.id, label: s.name }))}
          preacherOptions={(preachers ?? []).map((p) => ({ value: p.id, label: p.full_name }))}
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
          }}
        />
      </div>
    </div>
  );
}
