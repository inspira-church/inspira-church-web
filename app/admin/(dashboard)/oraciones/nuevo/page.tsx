import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SermonForm } from "@/components/admin/SermonForm";
import { PRAYER_TOPIC } from "@/lib/constants";
import { createSermon } from "@/lib/actions/sermons";
import { createClient } from "@/lib/supabase/server";

export default async function NewPrayerRecordingPage() {
  const supabase = await createClient();
  const [{ data: series }, { data: preachers }] = await Promise.all([
    supabase.from("sermon_series").select("id, name").order("name"),
    supabase.from("team_members").select("id, full_name").order("full_name"),
  ]);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Grabaciones de oración", href: "/admin/oraciones" },
          { label: "Nueva grabación" },
        ]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">
        Nueva grabación de oración
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Es una prédica normal — el tema &quot;{PRAYER_TOPIC}&quot; ya viene
        precargado para que aparezca en la sección de oración.
      </p>
      <div className="mt-8">
        <SermonForm
          action={createSermon}
          seriesOptions={(series ?? []).map((s) => ({ value: s.id, label: s.name }))}
          preacherOptions={(preachers ?? []).map((p) => ({ value: p.id, label: p.full_name }))}
          defaultTopics={PRAYER_TOPIC}
          cancelHref="/admin/oraciones"
        />
      </div>
    </div>
  );
}
