import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { GrowthGroup } from "@/types/content";

interface PublicGroupRow {
  id: string;
  name: string;
  slug: string;
  group_type: string;
  description: string | null;
  city: string;
  locality: string | null;
  sector: string | null;
  lat_approx: number | null;
  lng_approx: number | null;
  day_of_week: number;
  time_of_day: string;
  leader_full_name: string | null;
  leader_photo_url: string | null;
  coleader_full_name: string | null;
}

function mapRow(row: PublicGroupRow): GrowthGroup {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    groupType: row.group_type,
    description: row.description ?? "",
    city: row.city,
    locality: row.locality,
    sector: row.sector,
    latApprox: row.lat_approx,
    lngApprox: row.lng_approx,
    dayOfWeek: row.day_of_week,
    timeOfDay: row.time_of_day,
    leaderFullName: row.leader_full_name,
    leaderPhotoUrl: row.leader_photo_url,
    coleaderFullName: row.coleader_full_name,
  };
}

/**
 * Lee siempre de la VISTA pública, nunca de growth_groups directamente —
 * la vista es la única que no expone dirección exacta ni teléfono del
 * líder (ver 006_growth_groups.sql, Fase 2).
 */
export async function getPublicGroups(): Promise<GrowthGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_growth_groups")
    .select("*")
    .order("name");
  return (data ?? []).map(mapRow);
}

export async function getPublicGroupBySlug(slug: string): Promise<GrowthGroup | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_growth_groups")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapRow(data) : null;
}
