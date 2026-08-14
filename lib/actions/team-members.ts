"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { teamMemberSchema } from "@/lib/validations/team-member";

function parseForm(formData: FormData) {
  return {
    fullName: formData.get("fullName"),
    type: formData.get("type"),
    roleTitle: formData.get("roleTitle"),
    bio: formData.get("bio") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    orderIndex: formData.get("orderIndex") || 0,
    active: formData.get("active") === "on",
  };
}

export async function createTeamMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = teamMemberSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("team_members").insert({
    full_name: parsed.data.fullName,
    type: parsed.data.type,
    role_title: parsed.data.roleTitle,
    bio: parsed.data.bio,
    photo_url: parsed.data.photoUrl,
    order_index: parsed.data.orderIndex,
    active: parsed.data.active,
  });

  if (error) {
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/admin/equipo");
  redirect("/admin/equipo");
}

export async function updateTeamMember(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = teamMemberSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({
      full_name: parsed.data.fullName,
      type: parsed.data.type,
      role_title: parsed.data.roleTitle,
      bio: parsed.data.bio,
      photo_url: parsed.data.photoUrl,
      order_index: parsed.data.orderIndex,
      active: parsed.data.active,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/equipo");
  redirect("/admin/equipo");
}

/** Baja lógica — sermons.preacher_id y growth_groups.leader_id apuntan aquí. */
export async function toggleTeamMemberActive(id: string, nextActive: boolean) {
  const supabase = await createClient();
  await supabase.from("team_members").update({ active: nextActive }).eq("id", id);
  revalidatePath("/admin/equipo");
}
