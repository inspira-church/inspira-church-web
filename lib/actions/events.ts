"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations/event";

/** Mismo patrón que BeliefsEditor: `practicalInfoCount` oculto le dice al action cuántas filas leer de FormData. */
function parsePracticalInfo(formData: FormData) {
  const count = Number(formData.get("practicalInfoCount") ?? 0);
  const items = [];
  for (let i = 0; i < count; i++) {
    const title = formData.get(`practicalInfo.${i}.title`);
    const content = formData.get(`practicalInfo.${i}.content`);
    if (title || content) items.push({ title, content });
  }
  return items;
}

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    subtitle: formData.get("subtitle") || undefined,
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    promoVideoUrl: formData.get("promoVideoUrl") || undefined,
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime") || undefined,
    endDate: formData.get("endDate") || undefined,
    endTime: formData.get("endTime") || undefined,
    modality: formData.get("modality") || "presencial",
    locationName: formData.get("locationName") || undefined,
    address: formData.get("address") || undefined,
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
    locationPublic: formData.get("locationPublic") === "on",
    category: formData.get("category") || undefined,
    capacity: formData.get("capacity") || undefined,
    requiresRegistration: formData.get("requiresRegistration") === "on",
    registrationUrl: formData.get("registrationUrl") || undefined,
    registrationStatus: formData.get("registrationStatus") || undefined,
    showCountdown: formData.get("showCountdown") === "on",
    practicalInfo: parsePracticalInfo(formData),
    cost: formData.get("cost") || undefined,
    ageRange: formData.get("ageRange") || undefined,
    adminStatus: formData.get("adminStatus") || "activo",
    published: formData.get("published") === "on",
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

/** "activo"/"cancelado" en el formulario -> el único valor manual real que persiste en la columna `status`. "finalizado" nunca se escribe: se deriva siempre por fecha (ver lib/event-status.ts). */
function toRow(data: ReturnType<typeof eventSchema.parse>) {
  return {
    name: data.name,
    slug: data.slug,
    // ?? null (no solo `data.x`) en cada campo opcional: si se deja
    // `undefined`, JSON.stringify lo omite del payload y Supabase nunca
    // sobrescribe el valor anterior — un admin que borra un campo para
    // vaciarlo vería el valor viejo persistir para siempre. Bug real
    // encontrado durante la validación de esta sesión (subtitle/description
    // del evento existente), no exclusivo de un campo — se corrige en todos.
    subtitle: data.subtitle ?? null,
    description: data.description ?? null,
    image_url: data.imageUrl ?? null,
    promo_video_url: data.promoVideoUrl ?? null,
    event_date: data.eventDate,
    event_time: data.eventTime ?? null,
    end_date: data.endDate ?? null,
    end_time: data.endTime ?? null,
    modality: data.modality,
    location_name: data.locationName ?? null,
    address: data.address ?? null,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    location_public: data.locationPublic,
    category: data.category ?? null,
    capacity: data.capacity ?? null,
    requires_registration: data.requiresRegistration,
    registration_url: data.registrationUrl ?? null,
    registration_status: data.requiresRegistration ? (data.registrationStatus ?? null) : null,
    show_countdown: data.showCountdown,
    practical_info: data.practicalInfo,
    cost: data.cost ?? null,
    age_range: data.ageRange ?? null,
    status: data.adminStatus === "cancelado" ? "cancelado" : "proximo",
    published: data.published,
  };
}

export async function createEvent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = eventSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
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
    module: "events",
    action: "create",
    entityType: "event",
    entityId: data.id,
    description: `Creó el evento "${parsed.data.name}".`,
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  redirect("/admin/eventos");
}

export async function updateEvent(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = eventSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(toRow(parsed.data)).eq("id", id);

  if (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: "Ese slug ya está en uso — elige otro." } };
    }
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await logAudit({
    module: "events",
    action: "update",
    entityType: "event",
    entityId: id,
    description: `Actualizó el evento "${parsed.data.name}".`,
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  redirect("/admin/eventos");
}

export async function toggleEventPublished(id: string, nextPublished: boolean) {
  const supabase = await createClient();
  await supabase.from("events").update({ published: nextPublished }).eq("id", id);
  await logAudit({
    module: "events",
    action: nextPublished ? "publish" : "unpublish",
    entityType: "event",
    entityId: id,
    description: `${nextPublished ? "Publicó" : "Despublicó"} un evento.`,
  });
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
}

export async function deleteEvent(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar. Intenta de nuevo." };

  await logAudit({
    module: "events",
    action: "delete",
    entityType: "event",
    entityId: id,
    description: `Eliminó el evento "${name}".`,
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
}
