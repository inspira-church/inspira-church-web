"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { optionalText } from "@/lib/form-data";
import { createClient } from "@/lib/supabase/server";
import { setFlag } from "@/lib/toggle-flag";
import { growthGroupSchema } from "@/lib/validations/growth-group";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    groupType: formData.get("groupType"),
    description: optionalText(formData, "description"),
    city: formData.get("city"),
    locality: optionalText(formData, "locality"),
    sector: optionalText(formData, "sector"),
    latApprox: formData.get("latApprox") || undefined,
    lngApprox: formData.get("lngApprox") || undefined,
    locationPublic: formData.get("locationPublic") === "on",
    dayOfWeek: formData.get("dayOfWeek"),
    timeOfDay: formData.get("timeOfDay"),
    leaderId: formData.get("leaderId") || undefined,
    coleaderId: formData.get("coleaderId") || undefined,
    exactAddress: optionalText(formData, "exactAddress"),
    leaderPhonePrivate: optionalText(formData, "leaderPhonePrivate"),
    internalNotes: optionalText(formData, "internalNotes"),
    active: formData.get("active") === "on",
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

/** Texto opcional: "" se persiste tal cual (ver lib/form-data.ts); lat/lng y líderes sí usan null. */
function toRow(data: ReturnType<typeof growthGroupSchema.parse>) {
  return {
    name: data.name,
    slug: data.slug,
    group_type: data.groupType,
    description: data.description,
    city: data.city,
    locality: data.locality,
    sector: data.sector,
    lat_approx: data.latApprox ?? null,
    lng_approx: data.lngApprox ?? null,
    location_public: data.locationPublic,
    day_of_week: data.dayOfWeek,
    time_of_day: data.timeOfDay,
    leader_id: data.leaderId || null,
    coleader_id: data.coleaderId || null,
    exact_address: data.exactAddress,
    leader_phone_private: data.leaderPhonePrivate,
    internal_notes: data.internalNotes,
    active: data.active,
  };
}

export async function createGrowthGroup(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = growthGroupSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("growth_groups")
    .insert(toRow(parsed.data))
    .select("id")
    .single();

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  await logAudit({
    module: "groups",
    action: "create",
    entityType: "growth_group",
    entityId: data.id,
    description: `Creó el grupo "${parsed.data.name}".`,
  });

  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
  revalidatePath("/grupos/unirme");
  redirect("/admin/grupos");
}

export async function updateGrowthGroup(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = growthGroupSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  // .select("id"): sin filas afectadas (RLS o id inexistente) no hay error de Supabase.
  const { data: updated, error } = await supabase
    .from("growth_groups")
    .update(toRow(parsed.data))
    .eq("id", id)
    .select("id");

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }
  if (!updated || updated.length === 0) {
    return { error: "No se guardó nada: el grupo no existe o no tienes permiso para editarlo." };
  }

  await logAudit({
    module: "groups",
    action: "update",
    entityType: "growth_group",
    entityId: id,
    description: `Actualizó el grupo "${parsed.data.name}".`,
  });

  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
  revalidatePath("/grupos/unirme");
  redirect("/admin/grupos");
}

export async function toggleGrowthGroupActive(id: string, nextActive: boolean): Promise<ActionState> {
  const failure = await setFlag("growth_groups", id, "active", nextActive);
  if (failure) return { error: failure };

  await logAudit({
    module: "groups",
    action: nextActive ? "activate" : "deactivate",
    entityType: "growth_group",
    entityId: id,
    description: `${nextActive ? "Activó" : "Desactivó"} un grupo.`,
  });
  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
  revalidatePath("/grupos/unirme");
  return { success: true };
}
