"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Acciones de gestión interna (cambiar estado, notas, responsable). Los
 * valores vienen de <select>/<input> con opciones fijas en el formulario —
 * si algo no encaja, el tipo enum de Postgres lo rechaza. No llevan
 * useActionState con errores de campo: son utilidades del panel, no
 * formularios públicos.
 */

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("contacts")
    .update({
      status: formData.get("status"),
      internal_notes: formData.get("internalNotes") || null,
      assigned_to: formData.get("assignedTo") || null,
      follow_up_date: formData.get("followUpDate") || null,
    })
    .eq("id", id);
  revalidatePath("/admin/formularios");
}

export async function updateGroupJoinRequest(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("group_join_requests")
    .update({ status: formData.get("status") })
    .eq("id", id);
  revalidatePath("/admin/formularios");
}

export async function updatePrayerRequest(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("prayer_requests")
    .update({
      status: formData.get("status"),
      internal_notes: formData.get("internalNotes") || null,
      assigned_to: formData.get("assignedTo") || null,
    })
    .eq("id", id);
  revalidatePath("/admin/oracion");
}

/** Solo Admin puede borrar (ver política prayer_requests_delete_admin, Fase 2). */
export async function deletePrayerRequest(id: string) {
  const supabase = await createClient();
  await supabase.from("prayer_requests").delete().eq("id", id);
  revalidatePath("/admin/oracion");
}
