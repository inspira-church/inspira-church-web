import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SermonForm } from "@/components/admin/SermonForm";
import { createSermon } from "@/lib/actions/sermons";
import { createClient } from "@/lib/supabase/server";

export default async function NewSermonPage() {
  const supabase = await createClient();
  const [{ data: series }, { data: preachers }] = await Promise.all([
    supabase.from("sermon_series").select("id, name").order("name"),
    supabase.from("team_members").select("id, full_name").order("full_name"),
  ]);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Prédicas", href: "/admin/predicas" }, { label: "Nueva prédica" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Nueva prédica</h1>
      <div className="mt-8">
        <SermonForm
          action={createSermon}
          seriesOptions={(series ?? []).map((s) => ({ value: s.id, label: s.name }))}
          preacherOptions={(preachers ?? []).map((p) => ({ value: p.id, label: p.full_name }))}
        />
      </div>
    </div>
  );
}
