"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { growthGroupSchema } from "@/lib/validations/growth-group";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    groupType: formData.get("groupType"),
    description: formData.get("description") || undefined,
    city: formData.get("city"),
    locality: formData.get("locality") || undefined,
    sector: formData.get("sector") || undefined,
    latApprox: formData.get("latApprox") || undefined,
    lngApprox: formData.get("lngApprox") || undefined,
    dayOfWeek: formData.get("dayOfWeek"),
    timeOfDay: formData.get("timeOfDay"),
    leaderId: formData.get("leaderId") || undefined,
    coleaderId: formData.get("coleaderId") || undefined,
    exactAddress: formData.get("exactAddress") || undefined,
    leaderPhonePrivate: formData.get("leaderPhonePrivate") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
    active: formData.get("active") === "on",
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

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
  const { error } = await supabase.from("growth_groups").insert(toRow(parsed.data));

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo crear. Intenta de nuevo." };
  }

  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
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
  const { error } = await supabase
    .from("growth_groups")
    .update(toRow(parsed.data))
    .eq("id", id);

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
  redirect("/admin/grupos");
}

export async function toggleGrowthGroupActive(id: string, nextActive: boolean) {
  const supabase = await createClient();
  await supabase.from("growth_groups").update({ active: nextActive }).eq("id", id);
  revalidatePath("/admin/grupos");
  revalidatePath("/grupos");
}
