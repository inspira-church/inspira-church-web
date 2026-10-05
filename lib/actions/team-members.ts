"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { optionalText } from "@/lib/form-data";
import { createClient } from "@/lib/supabase/server";
import { teamMemberSchema } from "@/lib/validations/team-member";

function parseForm(formData: FormData) {
  return {
    fullName: formData.get("fullName"),
    type: formData.get("type"),
    roleTitle: formData.get("roleTitle"),
    // Texto: "" es válido (biografía vaciada a propósito). Ver lib/form-data.ts.
    bio: optionalText(formData, "bio"),
    // URL: un vacío no es una URL válida, se normaliza a null en toRow.
    photoUrl: formData.get("photoUrl") || undefined,
    orderIndex: formData.get("orderIndex") || 0,
    active: formData.get("active") === "on",
  };
}

function toRow(data: ReturnType<typeof teamMemberSchema.parse>) {
  return {
    full_name: data.fullName,
    type: data.type,
    role_title: data.roleTitle,
    // Sin `?? null`: "" debe persistirse como "" y `undefined` (campo ausente)
    // no debe tocar la columna.
    bio: data.bio,
    // `?? null` y no `data.photoUrl` a secas: si queda `undefined`,
    // JSON.stringify omite la clave y la foto anterior nunca se limpiaría.
    photo_url: data.photoUrl ?? null,
    order_index: data.orderIndex,
    active: data.active,
  };
}

/**
 * Los miembros del equipo se muestran en /nosotros (pastores y liderazgo) y
 * sus nombres/fotos como predicador en Inicio, /predicas y /oraciones. Las
 * páginas estáticas con ISR sirven la copia vieja hasta que alguien las
 * regenera, así que cada cambio las invalida a mano.
 */
function revalidateTeamPages() {
  revalidatePath("/admin/equipo");
  revalidatePath("/nosotros");
  revalidatePath("/oraciones");
  revalidatePath("/");
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
  const { data, error } = await supabase
    .from("team_members")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error) {
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  await logAudit({
    module: "team",
    action: "create",
    entityType: "team_member",
    entityId: data.id,
    description: `Creó a "${parsed.data.fullName}" en el equipo.`,
  });

  revalidateTeamPages();
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
  // .select("id"): un update bloqueado por RLS o sobre un id inexistente no
  // devuelve error, solo 0 filas — sin esto el formulario diría "guardado"
  // sin haber guardado nada.
  const { data: updated, error } = await supabase
    .from("team_members")
    .update(toRow(parsed.data))
    .eq("id", id)
    .select("id");

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }
  if (!updated || updated.length === 0) {
    return { error: "No se guardó nada: el miembro no existe o no tienes permiso para editarlo." };
  }

  await logAudit({
    module: "team",
    action: "update",
    entityType: "team_member",
    entityId: id,
    description: `Actualizó a "${parsed.data.fullName}" en el equipo.`,
  });

  revalidateTeamPages();
  redirect("/admin/equipo");
}

/** Baja lógica — sermons.preacher_id y growth_groups.leader_id apuntan aquí. */
export async function toggleTeamMemberActive(id: string, nextActive: boolean) {
  const supabase = await createClient();
  await supabase.from("team_members").update({ active: nextActive }).eq("id", id);
  await logAudit({
    module: "team",
    action: nextActive ? "activate" : "deactivate",
    entityType: "team_member",
    entityId: id,
    description: `${nextActive ? "Activó" : "Desactivó"} a un miembro del equipo.`,
  });
  revalidateTeamPages();
}
