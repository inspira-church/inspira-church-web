"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { firstTimeConnectionSchema } from "@/lib/validations/first-time-connection";

const RATE_LIMIT_ERROR =
  "Enviaste varios mensajes seguidos. Espera unos minutos antes de intentar de nuevo.";
const BOT_CHECK_ERROR = "No pudimos verificar que eres una persona. Intenta de nuevo.";

function parseForm(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message") || undefined,
    attendsOtherChurch: formData.get("attendsOtherChurch") === "si",
    wantsCall: formData.get("wantsCall") === "si",
    consent: formData.get("consent") === "on",
  };
}

export async function submitFirstTimeConnection(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`first-time-connection:${ip}`)) {
    return { error: RATE_LIMIT_ERROR };
  }

  if (!(await verifyTurnstile(formData))) {
    return { error: BOT_CHECK_ERROR };
  }

  const parsed = firstTimeConnectionSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("first_time_connections").insert({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    gender: parsed.data.gender,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    attends_other_church: parsed.data.attendsOtherChurch,
    wants_call: parsed.data.wantsCall,
    consent: parsed.data.consent,
  });

  if (error) {
    return { error: "No se pudo enviar tus datos. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
