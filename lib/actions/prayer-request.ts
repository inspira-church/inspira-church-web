"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { prayerRequestSchema } from "@/lib/validations/prayer-request";

const RATE_LIMIT_ERROR =
  "Enviaste varias peticiones seguidas. Espera unos minutos antes de intentar de nuevo.";
const BOT_CHECK_ERROR = "No pudimos verificar que eres una persona. Intenta de nuevo.";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    requestText: formData.get("request"),
    isPrivate: formData.get("isPrivate") === "on",
    consent: formData.get("consent") === "on",
  };
}

export async function submitPrayerRequest(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`prayer-request:${ip}`)) {
    return { error: RATE_LIMIT_ERROR };
  }

  if (!(await verifyTurnstile(formData))) {
    return { error: BOT_CHECK_ERROR };
  }

  const parsed = prayerRequestSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("prayer_requests").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    request_text: parsed.data.requestText,
    is_private: parsed.data.isPrivate,
    consent: parsed.data.consent,
  });

  if (error) {
    return { error: "No se pudo enviar tu petición. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
