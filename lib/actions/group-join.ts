"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { groupJoinSchema } from "@/lib/validations/group-join";

const RATE_LIMIT_ERROR =
  "Enviaste varias solicitudes seguidas. Espera unos minutos antes de intentar de nuevo.";
const BOT_CHECK_ERROR = "No pudimos verificar que eres una persona. Intenta de nuevo.";

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
  const ip = await getClientIp();
  if (!checkRateLimit(`group-join:${ip}`)) {
    return { error: RATE_LIMIT_ERROR };
  }

  if (!(await verifyTurnstile(formData))) {
    return { error: BOT_CHECK_ERROR };
  }

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
