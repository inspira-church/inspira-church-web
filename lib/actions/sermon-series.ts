"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { optionalText } from "@/lib/form-data";
import { createClient } from "@/lib/supabase/server";
import { setFlag } from "@/lib/toggle-flag";
import { sermonSeriesSchema } from "@/lib/validations/sermon-series";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: optionalText(formData, "description"),
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
      cover_image_url: parsed.data.coverImageUrl ?? null,
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
  revalidatePath("/predicas");
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
  // .select("id"): sin filas afectadas (RLS o id inexistente) no hay error de Supabase.
  const { data: updated, error } = await supabase
    .from("sermon_series")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      // `?? null`: si queda undefined, JSON.stringify omite la clave y la portada anterior no se limpia.
      cover_image_url: parsed.data.coverImageUrl ?? null,
      active: parsed.data.active,
    })
    .eq("id", id)
    .select("id");

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }
  if (!updated || updated.length === 0) {
    return { error: "No se guardó nada: la serie no existe o no tienes permiso para editarla." };
  }

  await logAudit({
    module: "sermons",
    action: "update",
    entityType: "sermon_series",
    entityId: id,
    description: `Actualizó la serie "${parsed.data.name}".`,
  });

  revalidatePath("/admin/series");
  revalidatePath("/predicas");
  redirect("/admin/series");
}

export async function toggleSermonSeriesActive(id: string, nextActive: boolean): Promise<ActionState> {
  const failure = await setFlag("sermon_series", id, "active", nextActive);
  if (failure) return { error: failure };

  await logAudit({
    module: "sermons",
    action: nextActive ? "activate" : "deactivate",
    entityType: "sermon_series",
    entityId: id,
    description: `${nextActive ? "Activó" : "Desactivó"} una serie.`,
  });
  revalidatePath("/admin/series");
  revalidatePath("/predicas");
  return { success: true };
}
