import { createPublicClient as createClient } from "@/lib/supabase/public";
import { PRAYER_TOPIC } from "@/lib/constants";

const SERMON_FIELDS =
  "id, title, slug, series_id, preacher_id, description, thumbnail_url, sermon_date, topics, featured";

interface SermonFilters {
  preacherId?: string;
  seriesId?: string;
  topic?: string;
  /** Coincide contra el título — ver getPublishedSermons para el motivo de no incluir predicador/serie. */
  search?: string;
}

const normalizedPrayerTopic = PRAYER_TOPIC.toLowerCase();

/** Las grabaciones de oración tienen su propia página (/oraciones) — nunca deben listarse entre las prédicas normales. */
function excludePrayerTopic<T extends { topics: string[] | null }>(rows: T[]): T[] {
  return rows.filter(
    (row) => !(row.topics ?? []).some((t) => t.trim().toLowerCase() === normalizedPrayerTopic)
  );
}

/**
 * Página de prédicas publicadas para /predicas — trae `limit + 1` para saber
 * si "Cargar más" debe mostrarse, sin una query de conteo aparte. El filtro
 * de oración se aplica después de paginar en Postgres, así que puede dejar
 * una página con menos de `limit` resultados visibles; con el volumen actual
 * de contenido (unas pocas grabaciones de oración entre docenas de
 * prédicas) es una simplificación razonable frente a excluir el tema desde
 * SQL, que exigiría una función o vista nueva solo para esto.
 */
export async function getPublishedSermonsPage(
  filters: SermonFilters,
  { offset = 0, limit = 9 }: { offset?: number; limit?: number } = {}
) {
  const supabase = await createClient();
  let query = supabase.from("sermons").select(SERMON_FIELDS).eq("published", true);

  if (filters.preacherId) query = query.eq("preacher_id", filters.preacherId);
  if (filters.seriesId) query = query.eq("series_id", filters.seriesId);
  if (filters.topic) query = query.contains("topics", [filters.topic]);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data } = await query
    .order("sermon_date", { ascending: false })
    .range(offset, offset + limit);

  const rows = excludePrayerTopic(data ?? []);
  const hasMore = rows.length > limit;
  return { sermons: rows.slice(0, limit), hasMore };
}

/** Todas las prédicas publicadas que cumplen los filtros — usado donde no aplica paginación (ej. exportar opciones de temas/predicadores). */
export async function getPublishedSermons(filters: SermonFilters = {}) {
  const supabase = await createClient();
  let query = supabase.from("sermons").select(SERMON_FIELDS).eq("published", true);

  if (filters.preacherId) query = query.eq("preacher_id", filters.preacherId);
  if (filters.seriesId) query = query.eq("series_id", filters.seriesId);
  if (filters.topic) query = query.contains("topics", [filters.topic]);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data } = await query.order("sermon_date", { ascending: false });
  return excludePrayerTopic(data ?? []);
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

/** Cuántas prédicas publicadas tiene cada serie — para "6 mensajes" en Explora por series. */
export async function getPublishedSermonCountsBySeriesId(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("series_id")
    .eq("published", true)
    .not("series_id", "is", null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.series_id) counts[row.series_id] = (counts[row.series_id] ?? 0) + 1;
  }
  return counts;
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
    .select(SERMON_FIELDS)
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

/** La prédica publicada más reciente (por fecha) — "Último mensaje" en /predicas. No confundir con featured/"Destacada". */
export async function getLatestSermon() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select(SERMON_FIELDS)
    .eq("published", true)
    .order("sermon_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Prédica marcada manualmente como "Destacada" — independiente de la fecha. Null si ninguna lo está. */
export async function getFeaturedSermon() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select(SERMON_FIELDS)
    .eq("published", true)
    .eq("featured", true)
    .order("sermon_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

/**
 * Prédicas relacionadas con `sermon`: primero misma serie, luego temas en
 * común, luego mismo predicador como último criterio — sin sistema de
 * recomendación, solo reglas simples en orden de prioridad. Nunca incluye
 * la prédica actual.
 */
export async function getRelatedSermons(
  sermon: { id: string; seriesId: string | null; topics: string[]; preacherId: string | null },
  limit = 3
) {
  const supabase = await createClient();
  const related: NonNullable<Awaited<ReturnType<typeof getSermonBySlug>>>[] = [];
  const seenIds = new Set([sermon.id]);

  if (sermon.seriesId) {
    const { data } = await supabase
      .from("sermons")
      .select(SERMON_FIELDS)
      .eq("published", true)
      .eq("series_id", sermon.seriesId)
      .neq("id", sermon.id)
      .order("sermon_date", { ascending: false })
      .limit(limit);
    for (const row of excludePrayerTopic(data ?? [])) {
      if (related.length >= limit) break;
      related.push(row);
      seenIds.add(row.id);
    }
  }

  if (related.length < limit && sermon.topics.length > 0) {
    const { data } = await supabase
      .from("sermons")
      .select(SERMON_FIELDS)
      .eq("published", true)
      .overlaps("topics", sermon.topics)
      .order("sermon_date", { ascending: false })
      .limit(limit + seenIds.size);
    for (const row of excludePrayerTopic(data ?? [])) {
      if (related.length >= limit) break;
      if (seenIds.has(row.id)) continue;
      related.push(row);
      seenIds.add(row.id);
    }
  }

  if (related.length < limit && sermon.preacherId) {
    const { data } = await supabase
      .from("sermons")
      .select(SERMON_FIELDS)
      .eq("published", true)
      .eq("preacher_id", sermon.preacherId)
      .order("sermon_date", { ascending: false })
      .limit(limit + seenIds.size);
    for (const row of excludePrayerTopic(data ?? [])) {
      if (related.length >= limit) break;
      if (seenIds.has(row.id)) continue;
      related.push(row);
      seenIds.add(row.id);
    }
  }

  return related;
}

/**
 * Temas únicos entre las prédicas publicadas — opciones del filtro de
 * /predicas. Excluye PRAYER_TOPIC: las grabaciones de oración tienen su
 * propia página (/oraciones) y no deben listarse ni filtrarse desde aquí.
 */
export async function getPublishedTopics() {
  const supabase = await createClient();
  const { data } = await supabase.from("sermons").select("topics").eq("published", true);
  const topics = new Set<string>();
  for (const row of data ?? []) {
    for (const topic of row.topics ?? []) {
      if (topic.trim().toLowerCase() !== normalizedPrayerTopic) topics.add(topic);
    }
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
