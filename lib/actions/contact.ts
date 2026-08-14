"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    reason: formData.get("reason"),
    message: formData.get("message") || undefined,
    consent: formData.get("consent") === "on",
  };
}

export async function submitContact(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    whatsapp: parsed.data.whatsapp,
    reason: parsed.data.reason,
    message: parsed.data.message,
    consent: parsed.data.consent,
  });

  if (error) {
    return { error: "No se pudo enviar tu mensaje. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
