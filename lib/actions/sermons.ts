"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { optionalText } from "@/lib/form-data";
import { getPublishedPrayerSermonsPage, getPublishedSermonsPage } from "@/lib/queries/sermons";
import { createClient } from "@/lib/supabase/server";
import { sermonSchema } from "@/lib/validations/sermon";

function parseForm(formData: FormData) {
  const topicsRaw = String(formData.get("topics") ?? "");
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    seriesId: formData.get("seriesId") || undefined,
    preacherId: formData.get("preacherId") || undefined,
    description: optionalText(formData, "description"),
    youtubeUrl: formData.get("youtubeUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    sermonDate: formData.get("sermonDate"),
    topics: topicsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    meetingType: formData.get("meetingType") || undefined,
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

/**
 * Prédicas y grabaciones de oración comparten la tabla `sermons`: un cambio
 * puede afectar /predicas, /oraciones y los bloques "Último mensaje"/"Ora con
 * nosotros" de Inicio. Las páginas estáticas con ISR sirven la copia vieja
 * hasta que alguien las regenera, así que se invalidan a mano.
 */
function revalidateSermonPages() {
  revalidatePath("/admin/predicas");
  revalidatePath("/admin/oraciones");
  revalidatePath("/predicas");
  revalidatePath("/oraciones");
  revalidatePath("/");
}

export async function createSermon(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sermonSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sermons")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      series_id: parsed.data.seriesId ?? null,
      preacher_id: parsed.data.preacherId ?? null,
      description: parsed.data.description,
      youtube_url: parsed.data.youtubeUrl,
      // `?? null`: si queda undefined, JSON.stringify omite la clave y la miniatura anterior no se limpia.
      thumbnail_url: parsed.data.thumbnailUrl ?? null,
      sermon_date: parsed.data.sermonDate,
      topics: parsed.data.topics,
      published: parsed.data.published,
      featured: parsed.data.featured,
      meeting_type: parsed.data.meetingType ?? null,
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
    entityType: "sermon",
    entityId: data.id,
    description: `Creó la prédica "${parsed.data.title}".`,
  });

  revalidateSermonPages();
  redirect("/admin/predicas");
}

export async function updateSermon(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = sermonSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  // .select("id"): sin filas afectadas (RLS o id inexistente) no hay error de Supabase.
  const { data: updated, error } = await supabase
    .from("sermons")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      series_id: parsed.data.seriesId ?? null,
      preacher_id: parsed.data.preacherId ?? null,
      description: parsed.data.description,
      youtube_url: parsed.data.youtubeUrl,
      // `?? null`: si queda undefined, JSON.stringify omite la clave y la miniatura anterior no se limpia.
      thumbnail_url: parsed.data.thumbnailUrl ?? null,
      sermon_date: parsed.data.sermonDate,
      topics: parsed.data.topics,
      published: parsed.data.published,
      featured: parsed.data.featured,
      meeting_type: parsed.data.meetingType ?? null,
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
    return { error: "No se guardó nada: la prédica no existe o no tienes permiso para editarla." };
  }

  await logAudit({
    module: "sermons",
    action: "update",
    entityType: "sermon",
    entityId: id,
    description: `Actualizó la prédica "${parsed.data.title}".`,
  });

  revalidateSermonPages();
  redirect("/admin/predicas");
}

export async function toggleSermonPublished(id: string, nextPublished: boolean) {
  const supabase = await createClient();
  await supabase.from("sermons").update({ published: nextPublished }).eq("id", id);
  await logAudit({
    module: "sermons",
    action: nextPublished ? "publish" : "unpublish",
    entityType: "sermon",
    entityId: id,
    description: `${nextPublished ? "Publicó" : "Despublicó"} una prédica.`,
  });
  revalidateSermonPages();
}

export async function deleteSermon(id: string, title: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sermons").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar. Intenta de nuevo." };

  await logAudit({
    module: "sermons",
    action: "delete",
    entityType: "sermon",
    entityId: id,
    description: `Eliminó la prédica "${title}".`,
  });

  revalidatePath("/admin/predicas");
  revalidatePath("/admin/oraciones");
  revalidatePath("/predicas");
  revalidatePath("/oraciones");
  revalidatePath("/");
}

/**
 * "Cargar más" en /predicas — se llama directo desde el cliente (SermonsList),
 * no desde un <form>. Es solo lectura pública, no necesita revalidar nada.
 */
export async function loadMoreSermons(
  filters: { preacherId?: string; seriesId?: string; topic?: string; search?: string },
  offset: number
) {
  return getPublishedSermonsPage(filters, { offset });
}

/** "Cargar más momentos" en /oraciones — mismo patrón de solo lectura que loadMoreSermons. */
export async function loadMorePrayerSermons(offset: number, excludeId?: string) {
  return getPublishedPrayerSermonsPage({ offset, excludeId });
}
