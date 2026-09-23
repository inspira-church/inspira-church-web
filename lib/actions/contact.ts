"use server";

import { sendContactNotifications } from "@/lib/email/contact-emails";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { verifyTurnstile } from "@/lib/turnstile";
import { contactSchema } from "@/lib/validations/contact";

const RATE_LIMIT_ERROR =
  "Enviaste varios mensajes seguidos. Espera unos minutos antes de intentar de nuevo.";
const BOT_CHECK_ERROR = "No pudimos verificar que eres una persona. Intenta de nuevo.";

function parseForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone"),
    preferredChannel: formData.get("preferredChannel"),
    reason: formData.get("reason"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
    eventSlug: formData.get("eventSlug") || undefined,
  };
}

/** Resuelve el slug a un id real de un evento publicado — nunca se confía en un id enviado desde el cliente. */
async function resolveEventId(eventSlug: string | undefined): Promise<string | null> {
  if (!eventSlug) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .eq("published", true)
    .maybeSingle();
  return data?.id ?? null;
}

export async function submitContact(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await getClientIp();
  if (!checkRateLimit(`contact:${ip}`)) {
    return { error: RATE_LIMIT_ERROR };
  }

  if (!(await verifyTurnstile(formData))) {
    return { error: BOT_CHECK_ERROR };
  }

  const parsed = contactSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const [eventId, settings] = await Promise.all([
    resolveEventId(parsed.data.eventSlug),
    getSiteSettings(),
  ]);

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    preferred_channel: parsed.data.preferredChannel,
    reason: parsed.data.reason,
    message: parsed.data.message,
    consent: parsed.data.consent,
    event_id: eventId,
    privacy_policy_version: settings.privacyPolicyUrl || null,
  });

  if (error) {
    return { error: "No se pudo enviar tu mensaje. Intenta de nuevo en un momento." };
  }

  // El contacto ya quedó guardado — a partir de aquí el email es una
  // notificación secundaria. sendContactNotifications nunca lanza (cada
  // envío atrapa su propio error), pero se envuelve en try/catch de todos
  // modos: un fallo aquí jamás debe convertirse en un error para el
  // visitante ni afectar el resultado ya exitoso del insert.
  try {
    await sendContactNotifications(
      {
        name: parsed.data.name,
        reason: parsed.data.reason,
        phone: parsed.data.phone,
        email: parsed.data.email,
        preferredChannel: parsed.data.preferredChannel,
        message: parsed.data.message,
      },
      { internalTo: settings.contactEmail || process.env.EMAIL_NOTIFICATION_TO || null }
    );
  } catch (err) {
    console.error(
      "[contact] fallo inesperado notificando por email:",
      err instanceof Error ? err.message : err
    );
  }

  return { success: true };
}
