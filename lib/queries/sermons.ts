import { createPublicClient as createClient } from "@/lib/supabase/public";

interface SermonFilters {
  preacherId?: string;
  seriesId?: string;
  topic?: string;
}

export async function getPublishedSermons(filters: SermonFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("sermons")
    .select(
      "id, title, slug, series_id, preacher_id, description, thumbnail_url, sermon_date, topics"
    )
    .eq("published", true)
    .order("sermon_date", { ascending: false });

  if (filters.preacherId) query = query.eq("preacher_id", filters.preacherId);
  if (filters.seriesId) query = query.eq("series_id", filters.seriesId);
  if (filters.topic) query = query.contains("topics", [filters.topic]);

  const { data } = await query;
  return data ?? [];
}

export async function getSermonBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

export async function getSermonsBySeriesId(seriesId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("id, title, slug, preacher_id, thumbnail_url, sermon_date")
    .eq("series_id", seriesId)
    .eq("published", true)
    .order("sermon_date");
  return data ?? [];
}

/**
 * Prédicas publicadas con un tema dado, sin distinguir mayúsculas/minúsculas
 * (el campo "Temas" del admin es texto libre, así que "Oración" y "oración"
 * deben tratarse igual). Usado por Inicio y /oraciones.
 */
export async function getPublishedSermonsByTopic(topic: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select(
      "id, title, slug, series_id, preacher_id, description, thumbnail_url, sermon_date, topics"
    )
    .eq("published", true)
    .order("sermon_date", { ascending: false });

  const normalized = topic.trim().toLowerCase();
  return (data ?? []).filter((row) =>
    (row.topics ?? []).some((t: string) => t.trim().toLowerCase() === normalized)
  );
}

/** Última prédica publicada con un tema dado — usado para "Oración de la semana" en Inicio. */
export async function getLatestSermonByTopic(topic: string) {
  const [latest] = await getPublishedSermonsByTopic(topic);
  return latest ?? null;
}

export async function getFeaturedSermon() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select(
      "id, title, slug, series_id, preacher_id, description, thumbnail_url, sermon_date"
    )
    .eq("published", true)
    .order("sermon_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Temas únicos entre las prédicas publicadas — opciones del filtro. */
export async function getPublishedTopics() {
  const supabase = await createClient();
  const { data } = await supabase.from("sermons").select("topics").eq("published", true);
  const topics = new Set<string>();
  for (const row of data ?? []) {
    for (const topic of row.topics ?? []) topics.add(topic);
  }
  return Array.from(topics).sort();
}

/** IDs de predicador con al menos una prédica publicada — para no listar predicadores sin contenido en el filtro. */
export async function getPreacherIdsWithPublishedSermons() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("preacher_id")
    .eq("published", true)
    .not("preacher_id", "is", null);
  return Array.from(new Set((data ?? []).map((row) => row.preacher_id as string)));
}
