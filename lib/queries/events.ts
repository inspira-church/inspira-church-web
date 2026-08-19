import { createPublicClient as createClient } from "@/lib/supabase/public";
import { isEventUpcoming } from "@/lib/event-status";
import type { ChurchEvent, EventPracticalInfoItem } from "@/types/content";

const EVENT_FIELDS =
  "id, name, subtitle, slug, description, image_url, event_date, event_time, end_date, end_time, location_name, address, lat, lng, location_public, modality, category, capacity, requires_registration, registration_url, registration_status, show_countdown, practical_info, cost, age_range, status, published";

interface EventRow {
  id: string;
  name: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  event_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  location_public: boolean;
  modality: ChurchEvent["modality"];
  category: string | null;
  capacity: number | null;
  requires_registration: boolean;
  registration_url: string | null;
  registration_status: ChurchEvent["registrationStatus"];
  show_countdown: boolean;
  practical_info: EventPracticalInfoItem[] | null;
  cost: string | null;
  age_range: string | null;
  status: ChurchEvent["status"];
  published: boolean;
}

/** Oculta address/lat/lng cuando location_public = false — mismo patrón que public_growth_groups (019). locationName en texto se sigue mostrando. */
function mapRow(row: EventRow): ChurchEvent {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    slug: row.slug,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    eventDate: row.event_date,
    eventTime: row.event_time,
    endDate: row.end_date,
    endTime: row.end_time,
    locationName: row.location_name,
    address: row.location_public ? row.address : null,
    lat: row.location_public ? row.lat : null,
    lng: row.location_public ? row.lng : null,
    locationPublic: row.location_public,
    modality: row.modality,
    category: row.category,
    capacity: row.capacity,
    requiresRegistration: row.requires_registration,
    registrationUrl: row.registration_url,
    registrationStatus: row.registration_status,
    showCountdown: row.show_countdown,
    practicalInfo: row.practical_info ?? [],
    cost: row.cost,
    ageRange: row.age_range,
    status: row.status,
    published: row.published,
  };
}

export async function getPublishedEvents(): Promise<ChurchEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_FIELDS)
    .eq("published", true)
    .order("event_date", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function getPublishedEventBySlug(slug: string): Promise<ChurchEvent | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_FIELDS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? mapRow(data) : null;
}

/**
 * Hasta `limit` eventos relacionados: prioriza la misma categoría (si el
 * evento actual tiene una) y completa cronológicamente — sin motor de
 * recomendación, mismo patrón simple que getRelatedSermons/
 * getRelatedPrayerSermons.
 */
export async function getRelatedEvents(
  currentId: string,
  category: string | null,
  limit = 3
): Promise<ChurchEvent[]> {
  const events = await getPublishedEvents();
  const others = events
    .filter((e) => e.id !== currentId && isEventUpcoming(e))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  if (!category) return others.slice(0, limit);

  const sameCategory = others.filter((e) => e.category === category);
  const rest = others.filter((e) => e.category !== category);
  return [...sameCategory, ...rest].slice(0, limit);
}
