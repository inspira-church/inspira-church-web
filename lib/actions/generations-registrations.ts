"use server";

import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { getSiteSettings } from "@/lib/queries/settings";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { generationsRegistrationSchema } from "@/lib/validations/generations-registration";

const RATE_LIMIT_ERROR =
  "Enviaste varias solicitudes seguidas. Espera unos minutos antes de intentar de nuevo.";
const BOT_CHECK_ERROR = "No pudimos verificar que eres una persona. Intenta de nuevo.";

function parseForm(formData: FormData) {
  return {
    childFirstName: formData.get("childFirstName"),
    childLastName: formData.get("childLastName"),
    childAge: formData.get("childAge"),
    childSchool: formData.get("childSchool") || undefined,
    allergies: formData.get("allergies") || undefined,
    areaInterest: formData.get("areaInterest") || undefined,
    guardianName: formData.get("guardianName"),
    guardianPhone: formData.get("guardianPhone"),
    guardianEmail: formData.get("guardianEmail") || "",
    emergencyContactName: formData.get("emergencyContactName") || undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
    dataConsent: formData.get("dataConsent") === "on",
    imageConsent: formData.get("imageConsent") === "on",
  };
}

/**
 * Público, sin sesión — mismo patrón que submitGroupJoin: rate limit +
 * Turnstile + Zod + insert. Nunca llama a logAudit (los envíos públicos no
 * se auditan, solo las acciones de staff sobre ellos, ver lib/actions/inbox.ts).
 */
export async function submitGenerationsRegistration(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`generations-registration:${ip}`)) {
    return { error: RATE_LIMIT_ERROR };
  }

  if (!(await verifyTurnstile(formData))) {
    return { error: BOT_CHECK_ERROR };
  }

  const parsed = generationsRegistrationSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const settings = await getSiteSettings();
  const supabase = await createClient();
  const { error } = await supabase.from("generations_registrations").insert({
    child_first_name: parsed.data.childFirstName,
    child_last_name: parsed.data.childLastName,
    child_age: parsed.data.childAge,
    child_school: parsed.data.childSchool || null,
    allergies: parsed.data.allergies || null,
    area_interest: parsed.data.areaInterest || null,
    guardian_name: parsed.data.guardianName,
    guardian_phone: parsed.data.guardianPhone,
    guardian_email: parsed.data.guardianEmail || null,
    emergency_contact_name: parsed.data.emergencyContactName || null,
    emergency_contact_phone: parsed.data.emergencyContactPhone || null,
    data_consent: parsed.data.dataConsent,
    image_consent: parsed.data.imageConsent,
    privacy_policy_version: settings.privacyPolicyUrl || null,
  });

  if (error) {
    return { error: "No se pudo enviar la inscripción. Intenta de nuevo en un momento." };
  }

  return { success: true };
}
