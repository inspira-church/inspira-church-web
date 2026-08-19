"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { sermonSeriesSchema } from "@/lib/validations/sermon-series";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    active: formData.get("active") === "on",
  };
}

/** El slug es único en la base de datos (23505) — este es el único error que traducimos a un campo específico. */
function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

export async function createSermonSeries(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sermonSeriesSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sermon_series")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      cover_image_url: parsed.data.coverImageUrl,
      active: parsed.data.active,
    })
    .select("id")
    .single();

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  await logAudit({
    module: "sermons",
    action: "create",
    entityType: "sermon_series",
    entityId: data.id,
    description: `Creó la serie "${parsed.data.name}".`,
  });

  revalidatePath("/admin/series");
  redirect("/admin/series");
}

export async function updateSermonSeries(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sermonSeriesSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sermon_series")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      cover_image_url: parsed.data.coverImageUrl,
      active: parsed.data.active,
    })
    .eq("id", id);

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await logAudit({
    module: "sermons",
    action: "update",
    entityType: "sermon_series",
    entityId: id,
    description: `Actualizó la serie "${parsed.data.name}".`,
  });

  revalidatePath("/admin/series");
  redirect("/admin/series");
}

export async function toggleSermonSeriesActive(id: string, nextActive: boolean) {
  const supabase = await createClient();
  await supabase.from("sermon_series").update({ active: nextActive }).eq("id", id);
  await logAudit({
    module: "sermons",
    action: nextActive ? "activate" : "deactivate",
    entityType: "sermon_series",
    entityId: id,
    description: `${nextActive ? "Activó" : "Desactivó"} una serie.`,
  });
  revalidatePath("/admin/series");
}
