"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validations/event";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    eventDate: formData.get("eventDate"),
    eventTime: formData.get("eventTime") || undefined,
    locationName: formData.get("locationName") || undefined,
    address: formData.get("address") || undefined,
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
    capacity: formData.get("capacity") || undefined,
    registrationUrl: formData.get("registrationUrl") || undefined,
    status: formData.get("status"),
    published: formData.get("published") === "on",
  };
}

function isDuplicateSlugError(error: { code?: string } | null) {
  return error?.code === "23505";
}

function toRow(data: ReturnType<typeof eventSchema.parse>) {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description,
    image_url: data.imageUrl,
    event_date: data.eventDate,
    event_time: data.eventTime,
    location_name: data.locationName,
    address: data.address,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    capacity: data.capacity ?? null,
    registration_url: data.registrationUrl,
    status: data.status,
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
