"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { sermonSchema } from "@/lib/validations/sermon";

function parseForm(formData: FormData) {
  const topicsRaw = String(formData.get("topics") ?? "");
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    seriesId: formData.get("seriesId") || undefined,
    preacherId: formData.get("preacherId") || undefined,
    description: formData.get("description") || undefined,
    youtubeUrl: formData.get("youtubeUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") || undefined,
    sermonDate: formData.get("sermonDate"),
    topics: topicsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    published: formData.get("published") === "on",
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
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
  const { error } = await supabase.from("sermons").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    series_id: parsed.data.seriesId ?? null,
    preacher_id: parsed.data.preacherId ?? null,
    description: parsed.data.description,
    youtube_url: parsed.data.youtubeUrl,
    thumbnail_url: parsed.data.thumbnailUrl,
    sermon_date: parsed.data.sermonDate,
    topics: parsed.data.topics,
    published: parsed.data.published,
  });

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
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
  const { error } = await supabase
    .from("sermons")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      series_id: parsed.data.seriesId ?? null,
      preacher_id: parsed.data.preacherId ?? null,
      description: parsed.data.description,
      youtube_url: parsed.data.youtubeUrl,
      thumbnail_url: parsed.data.thumbnailUrl,
      sermon_date: parsed.data.sermonDate,
      topics: parsed.data.topics,
      published: parsed.data.published,
    })
    .eq("id", id);

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
  redirect("/admin/predicas");
}

export async function toggleSermonPublished(id: string, nextPublished: boolean) {
  const supabase = await createClient();
  await supabase.from("sermons").update({ published: nextPublished }).eq("id", id);
  revalidatePath("/admin/predicas");
  revalidatePath("/predicas");
}
