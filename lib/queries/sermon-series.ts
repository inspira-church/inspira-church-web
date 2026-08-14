import { createClient } from "@/lib/supabase/server";

export async function getActiveSermonSeries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermon_series")
    .select("id, name, slug, description, cover_image_url")
    .eq("active", true)
    .order("name");
  return data ?? [];
}

export async function getSermonSeriesBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermon_series")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function getSermonSeriesById(id: string | null) {
  if (!id) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermon_series")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();
  return data;
}
