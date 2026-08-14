import { createClient } from "@/lib/supabase/server";

export async function getActiveTeamMembers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, full_name, type, role_title, bio, photo_url, order_index")
    .eq("active", true)
    .order("order_index");
  return data ?? [];
}

export async function getTeamMemberById(id: string | null) {
  if (!id) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, full_name, photo_url")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getTeamMembersByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("id, full_name")
    .in("id", ids)
    .order("full_name");
  return data ?? [];
}
