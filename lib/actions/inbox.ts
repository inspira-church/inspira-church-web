"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
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
  const status = formData.get("status");
  await supabase
    .from("contacts")
    .update({
      status,
      internal_notes: formData.get("internalNotes") || null,
      assigned_to: formData.get("assignedTo") || null,
      follow_up_date: formData.get("followUpDate") || null,
    })
    .eq("id", id);
  await logAudit({
    module: "inbox",
    action: "update",
    entityType: "contact",
    entityId: id,
    description: `Actualizó un contacto (estado: ${status}).`,
  });
  revalidatePath("/admin/formularios");
}

export async function updateGroupJoinRequest(id: string, formData: FormData) {
  const supabase = await createClient();
  const status = formData.get("status");
  await supabase.from("group_join_requests").update({ status }).eq("id", id);
  await logAudit({
    module: "inbox",
    action: "update",
    entityType: "group_join_request",
    entityId: id,
    description: `Actualizó una solicitud de grupo (estado: ${status}).`,
  });
  revalidatePath("/admin/formularios");
}

export async function updatePrayerRequest(id: string, formData: FormData) {
  const supabase = await createClient();
  const status = formData.get("status");
  await supabase
    .from("prayer_requests")
    .update({
      status,
      internal_notes: formData.get("internalNotes") || null,
      assigned_to: formData.get("assignedTo") || null,
    })
    .eq("id", id);
  await logAudit({
    module: "prayer_requests",
    action: "update",
    entityType: "prayer_request",
    entityId: id,
    description: `Actualizó una petición de oración (estado: ${status}).`,
  });
  revalidatePath("/admin/oracion");
}

export async function updateFirstTimeConnection(id: string, formData: FormData) {
  const supabase = await createClient();
  const status = formData.get("status");
  await supabase
    .from("first_time_connections")
    .update({
      status,
      internal_notes: formData.get("internalNotes") || null,
      assigned_to: formData.get("assignedTo") || null,
    })
    .eq("id", id);
  await logAudit({
    module: "inbox",
    action: "update",
    entityType: "first_time_connection",
    entityId: id,
    description: `Actualizó una ficha de conexión de Primera vez (estado: ${status}).`,
  });
  revalidatePath("/admin/formularios");
}

/** Solo Admin puede borrar (ver política prayer_requests_delete_admin, Fase 2). */
export async function deletePrayerRequest(id: string) {
  const supabase = await createClient();
  await supabase.from("prayer_requests").delete().eq("id", id);
  await logAudit({
    module: "prayer_requests",
    action: "delete",
    entityType: "prayer_request",
    entityId: id,
    description: "Borró una petición de oración.",
  });
  revalidatePath("/admin/oracion");
}

/** Staff (is_editor_or_admin) puede borrar — ver política contacts_delete_staff, 008_forms.sql. */
export async function deleteContact(id: string) {
  const supabase = await createClient();
  await supabase.from("contacts").delete().eq("id", id);
  await logAudit({
    module: "inbox",
    action: "delete",
    entityType: "contact",
    entityId: id,
    description: "Borró un contacto.",
  });
  revalidatePath("/admin/formularios");
}

/** Staff (is_editor_or_admin) puede borrar — ver política group_join_requests_delete_staff, 008_forms.sql. */
export async function deleteGroupJoinRequest(id: string) {
  const supabase = await createClient();
  await supabase.from("group_join_requests").delete().eq("id", id);
  await logAudit({
    module: "inbox",
    action: "delete",
    entityType: "group_join_request",
    entityId: id,
    description: "Borró una solicitud de grupo.",
  });
  revalidatePath("/admin/formularios");
}

/** Staff (is_editor_or_admin) puede borrar — ver política first_time_connections_delete_staff, 017_first_time_connections.sql. */
export async function deleteFirstTimeConnection(id: string) {
  const supabase = await createClient();
  await supabase.from("first_time_connections").delete().eq("id", id);
  await logAudit({
    module: "inbox",
    action: "delete",
    entityType: "first_time_connection",
    entityId: id,
    description: "Borró una ficha de conexión de Primera vez.",
  });
  revalidatePath("/admin/formularios");
}
