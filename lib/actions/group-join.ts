"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { groupJoinSchema } from "@/lib/validations/group-join";

function parseForm(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    age: formData.get("age") || undefined,
    city: formData.get("city"),
    locality: formData.get("locality") || undefined,
    neighborhood: formData.get("neighborhood") || undefined,
    groupId: formData.get("groupId") || undefined,
    availability: formData.get("availability") || undefined,
    notes: formData.get("notes") || undefined,
    consent: formData.get("consent") === "on",
  };
}

export async function submitGroupJoin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = groupJoinSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("group_join_requests").insert({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
    email: parsed.data.email,
    age: parsed.data.age ?? null,
    city: parsed.data.city,
    locality: parsed.data.locality,
    neighborhood: parsed.data.neighborhood,
    group_id: parsed.data.groupId || null,
    availability: parsed.data.availability,
    notes: parsed.data.notes,
    consent: parsed.data.consent,
  });

  if (error) {
    return { error: "No se pudo enviar tu solicitud. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
