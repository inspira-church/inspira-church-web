import type { ChurchEvent, EventStatus } from "@/types/content";

/**
 * "Próximo" vs "Finalizado" se calculan siempre desde la fecha/hora real —
 * nunca se guardan en Supabase (ver migración 022). Solo "cancelado" sigue
 * siendo una bandera manual real que el admin controla. Construye el mismo
 * Date "naive" (sin offset) que ya usa lib/format.ts en todo el proyecto,
 * para no introducir una segunda forma de interpretar fechas/zona horaria.
 */
function eventEndMoment(event: Pick<ChurchEvent, "eventDate" | "eventTime" | "endDate" | "endTime">): Date {
  const date = event.endDate || event.eventDate;
  const time = event.endTime || event.eventTime || "23:59";
  return new Date(`${date}T${time}`);
}

export function eventStartMoment(event: Pick<ChurchEvent, "eventDate" | "eventTime">): Date {
  return new Date(`${event.eventDate}T${event.eventTime || "00:00"}`);
}

/** Fuente única de verdad para el estado visible de un evento — úsala en vez de leer `event.status` directamente. */
export function deriveEventStatus(
  event: Pick<ChurchEvent, "status" | "eventDate" | "eventTime" | "endDate" | "endTime">
): EventStatus {
  if (event.status === "cancelado") return "cancelado";
  return eventEndMoment(event).getTime() < Date.now() ? "finalizado" : "proximo";
}

export function isEventUpcoming(
  event: Pick<ChurchEvent, "status" | "eventDate" | "eventTime" | "endDate" | "endTime">
): boolean {
  return deriveEventStatus(event) === "proximo";
}

/** Milisegundos restantes hasta que empiece el evento — null si ya empezó/no aplica. */
export function msUntilEventStart(event: Pick<ChurchEvent, "eventDate" | "eventTime">): number | null {
  const diff = eventStartMoment(event).getTime() - Date.now();
  return diff > 0 ? diff : null;
}

/**
 * Deriva una etiqueta de CTA a partir del destino de inscripción — evita
 * pedirle al admin un campo "tipo" redundante con la URL que ya escribe.
 */
export function registrationCtaLabel(url: string): string {
  const normalized = url.toLowerCase();
  if (normalized.includes("wa.me") || normalized.includes("whatsapp.com")) return "Escríbenos por WhatsApp";
  if (normalized.includes("docs.google.com/forms") || normalized.includes("forms.gle")) {
    return "Completar formulario";
  }
  return "Inscribirme";
}
