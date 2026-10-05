import { CONTACT_REASON_LABEL, PREFERRED_CHANNEL_LABEL } from "@/lib/constants-admin";
import type { EmailField } from "@/lib/email/form-templates";

/**
 * Un formatter por tipo de formulario: decide QUÉ campos y con qué etiquetas
 * se muestran en el aviso interno. El envío en sí es central
 * (form-notifications.ts). Cada formatter recibe datos ya validados por el
 * esquema Zod de su formulario y decide también qué NO se manda por correo
 * (datos de menores, peticiones privadas): lo sensible se consulta en el CMS.
 */

export interface FormSubmissionEmail {
  /** Para `{{nombre}}` en la respuesta automática y el resumen del asunto interno. */
  visitorName: string | null;
  /** Correo del visitante: destino de la respuesta automática y Reply-To del aviso interno. */
  visitorEmail: string | null;
  fields: EmailField[];
  note?: string | null;
  /** Encabezado y prefijo de asunto propios de esta solicitud (si difieren de los del formulario). Nunca deben contener datos sensibles. */
  title?: string;
  subjectPrefix?: string;
  /** true = el aviso interno NO lleva Reply-To (el correo del visitante no viaja a los destinatarios). */
  suppressReplyTo?: boolean;
}

const clean = (value: string | null | undefined) => {
  const v = (value ?? "").trim();
  return v === "" ? null : v;
};

export interface ContactSubmissionInput {
  name: string;
  reason: string;
  phone: string;
  email?: string | null;
  preferredChannel: string;
  message: string;
}

export function formatContactSubmission(data: ContactSubmissionInput): FormSubmissionEmail {
  return {
    visitorName: clean(data.name),
    visitorEmail: clean(data.email),
    fields: [
      { label: "Nombre", value: data.name },
      { label: "Motivo", value: CONTACT_REASON_LABEL[data.reason] ?? data.reason },
      { label: "Teléfono / WhatsApp", value: data.phone },
      { label: "Correo", value: clean(data.email) ?? "No proporcionado" },
      {
        label: "Prefiere que lo contacten por",
        value: PREFERRED_CHANNEL_LABEL[data.preferredChannel] ?? data.preferredChannel,
      },
      { label: "Mensaje", value: data.message },
    ],
  };
}

export interface FirstTimeSubmissionInput {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  message?: string | null;
  attendsOtherChurch: boolean;
  wantsCall: boolean;
}

export function formatFirstTimeSubmission(data: FirstTimeSubmissionInput): FormSubmissionEmail {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  return {
    visitorName: clean(data.firstName),
    visitorEmail: clean(data.email),
    fields: [
      { label: "Nombre", value: fullName },
      { label: "Género", value: data.gender === "mujer" ? "Mujer" : "Hombre" },
      { label: "Correo", value: data.email },
      { label: "Celular", value: data.phone },
      { label: "Asiste a otra iglesia", value: data.attendsOtherChurch ? "Sí" : "No" },
      { label: "Quiere recibir una llamada", value: data.wantsCall ? "Sí" : "No" },
      { label: "Mensaje", value: clean(data.message) },
    ],
  };
}

export interface PrayerSubmissionInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  requestText: string;
  isPrivate: boolean;
}

/** Cuántos caracteres de una petición NO privada viajan por correo; el resto se lee en el CMS. */
export const PRAYER_EMAIL_EXCERPT_LENGTH = 300;

/**
 * Peticiones de oración — minimización de datos por ambos lados:
 *
 * - PRIVADA (el formulario le promete al visitante que solo el Administrador
 *   la lee, no el resto del equipo): el aviso lleva únicamente el nombre y la
 *   indicación de consultarla en el CMS. Ni el texto, ni el teléfono, ni el
 *   correo en el cuerpo, ni Reply-To (el correo del visitante no viaja a
 *   destinatarios que podrían no ser Administradores).
 * - NO privada: el texto va recortado y sin teléfono ni correo en el cuerpo
 *   (Reply-To sí, para poder responder). Lo completo se consulta en el CMS.
 *
 * La respuesta automática al visitante nunca incluye el texto de su petición.
 */
export function formatPrayerSubmission(data: PrayerSubmissionInput): FormSubmissionEmail {
  const base = { visitorName: clean(data.name), visitorEmail: clean(data.email) };

  if (data.isPrivate) {
    return {
      ...base,
      title: "NUEVA PETICIÓN DE ORACIÓN PRIVADA",
      subjectPrefix: "Nueva petición de oración privada en inspirachurch.co",
      suppressReplyTo: true,
      fields: [{ label: "Nombre", value: data.name }],
      note: "Nueva petición de oración privada recibida. La petición quedó registrada en el CMS: ingresa al panel autorizado (solo Administrador) para consultar su contenido.",
    };
  }

  const text = data.requestText.trim();
  const truncated = text.length > PRAYER_EMAIL_EXCERPT_LENGTH;
  return {
    ...base,
    fields: [
      { label: "Nombre", value: data.name },
      {
        label: "Petición",
        value: truncated ? `${text.slice(0, PRAYER_EMAIL_EXCERPT_LENGTH).trimEnd()}…` : text,
      },
    ],
    note: truncated
      ? "La petición está recortada: léela completa en el CMS. El teléfono y el correo también están allí."
      : "El teléfono y el correo de contacto, si los dejó, están en el CMS.",
  };
}

export interface GroupJoinSubmissionInput {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  age?: number | null;
  city: string;
  locality?: string | null;
  neighborhood?: string | null;
  /** Nombre del grupo elegido ya resuelto; null si pidió que lo recomienden. */
  groupName?: string | null;
  availability?: string | null;
  notes?: string | null;
}

export function formatGroupJoinSubmission(data: GroupJoinSubmissionInput): FormSubmissionEmail {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  return {
    visitorName: clean(data.firstName),
    visitorEmail: clean(data.email),
    fields: [
      { label: "Nombre", value: fullName },
      { label: "Teléfono", value: data.phone },
      { label: "WhatsApp", value: clean(data.whatsapp) },
      { label: "Correo", value: clean(data.email) },
      { label: "Edad", value: data.age != null ? String(data.age) : null },
      { label: "Ciudad", value: data.city },
      { label: "Localidad", value: clean(data.locality) },
      { label: "Barrio", value: clean(data.neighborhood) },
      { label: "Grupo de interés", value: clean(data.groupName) ?? "Pidió que le recomienden uno" },
      { label: "Disponibilidad", value: clean(data.availability) },
      { label: "Notas", value: clean(data.notes) },
    ],
  };
}

export interface GenerationsSubmissionInput {
  childFirstName: string;
  childLastName: string;
  childAge: number;
  areaInterest?: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string | null;
}

/**
 * Inscripción de un menor: por minimización de datos el correo solo trae lo
 * necesario para contactar al acudiente. Alergias, colegio, contacto de
 * emergencia y autorizaciones se consultan en el CMS (solo Administrador).
 */
export function formatGenerationsSubmission(data: GenerationsSubmissionInput): FormSubmissionEmail {
  return {
    visitorName: clean(data.guardianName),
    visitorEmail: clean(data.guardianEmail),
    fields: [
      { label: "Niño/a o joven", value: `${data.childFirstName} ${data.childLastName}`.trim() },
      { label: "Edad", value: String(data.childAge) },
      { label: "Área de interés", value: clean(data.areaInterest) },
      { label: "Acudiente", value: data.guardianName },
      { label: "Teléfono del acudiente", value: data.guardianPhone },
      { label: "Correo del acudiente", value: clean(data.guardianEmail) },
    ],
    note: "Alergias, colegio, contacto de emergencia y autorizaciones: consúltalos en el CMS (solo Administrador).",
  };
}
