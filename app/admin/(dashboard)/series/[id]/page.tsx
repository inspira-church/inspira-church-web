import { notFound } from "next/navigation";
import { SermonSeriesForm } from "@/components/admin/SermonSeriesForm";
import { updateSermonSeries } from "@/lib/actions/sermon-series";
import { createClient } from "@/lib/supabase/server";

export default async function EditSermonSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("sermon_series")
    .select("*")
    .eq("id", id)
    .single();

  if (!series) notFound();

  const updateWithId = updateSermonSeries.bind(null, id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Editar serie</h1>
      <div className="mt-8">
        <SermonSeriesForm
          action={updateWithId}
          defaultValues={{
            name: series.name,
            slug: series.slug,
            description: series.description,
            coverImageUrl: series.cover_image_url,
            active: series.active,
          }}
        />
      </div>
    </div>
  );
}
