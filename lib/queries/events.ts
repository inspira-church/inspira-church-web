import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { ChurchEvent } from "@/types/content";

interface EventRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  event_time: string | null;
  location_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  capacity: number | null;
  registration_url: string | null;
  status: ChurchEvent["status"];
  published: boolean;
}

function mapRow(row: EventRow): ChurchEvent {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    eventDate: row.event_date,
    eventTime: row.event_time,
    locationName: row.location_name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    capacity: row.capacity,
    registrationUrl: row.registration_url,
    status: row.status,
    published: row.published,
  };
}

export async function getPublishedEvents(): Promise<ChurchEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, name, slug, description, image_url, event_date, event_time, location_name, address, lat, lng, capacity, registration_url, status, published"
    )
    .eq("published", true)
    .order("event_date", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function getPublishedEventBySlug(slug: string): Promise<ChurchEvent | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, name, slug, description, image_url, event_date, event_time, location_name, address, lat, lng, capacity, registration_url, status, published"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? mapRow(data) : null;
}
