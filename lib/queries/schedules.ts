import { createPublicClient as createClient } from "@/lib/supabase/public";

export async function getActiveSchedules() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schedules")
    .select("id, type, name, day_of_week, time_of_day, location")
    .eq("active", true)
    .order("order_index");
  return data ?? [];
}

/**
 * Horarios activos cuyo nombre empieza por "oración" (ej. "Oración
 * Presencial") — fuente única para Inicio y /oraciones, así ninguna de las
 * dos páginas hardcodea un horario propio. Si cambian desde
 * /admin/horarios, ambas páginas se actualizan solas.
 */
export async function getPrayerSchedules() {
  const schedules = await getActiveSchedules();
  return schedules.filter((s) => s.name.toLowerCase().startsWith("oración"));
}
