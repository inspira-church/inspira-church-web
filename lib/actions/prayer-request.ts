"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { prayerRequestSchema } from "@/lib/validations/prayer-request";

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
