import { createClient } from "@/lib/supabase/server";

export async function getActiveSchedules() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("schedules")
    .select("id, type, name, day_of_week, time_of_day, location")
    .eq("active", true)
    .order("order_index");
  return data ?? [];
}
