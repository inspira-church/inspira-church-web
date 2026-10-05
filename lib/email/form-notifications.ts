import { SITE_URL } from "@/lib/constants";
import {
  type FormEmailConfig,
  type FormEmailRow,
  GLOBAL_FORM_KEY,
  resolveSettingsFromRows,
} from "@/lib/email/form-config";
import { FORM_DEFINITIONS, type FormType } from "@/lib/email/form-definitions";
import type { FormSubmissionEmail } from "@/lib/email/form-formatters";
import { resolveInternalRecipients } from "@/lib/email/form-recipients";
import { buildAutoReplyEmail, buildInternalEmail, sanitizeInline } from "@/lib/email/form-templates";
import { getEmailFrom, getResendClient, isEmailConfigured } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Servicio ÚNICO de notificaciones por email de los formularios públicos.
 *
 * Flujo (lo impone quien lo llama): validar → antispam → INSERT en Supabase →
 * sendFormNotifications. Este módulo nunca lanza y nunca revierte nada: la
 * solicitud ya está guardada y el visitante ya tiene su éxito. Cada envío
 * atrapa su propio error por separado (el aviso interno no depende de la
 * respuesta automática ni al revés) y los errores se registran sin datos
 * personales ni secretos.
 */

export type SendOutcome = "sent" | "skipped" | "not_configured" | "error";

export interface FormNotificationsResult {
  internal: SendOutcome;
  visitor: SendOutcome;
  /** Cuántos correos internos se intentaron (0 si no hubo destinatarios). */
  internalRecipients: number;
}

export interface ResolvedFormEmailSettings {
  config: FormEmailConfig;
  defaultRecipient: string;
}

let warnedConfig = false;

/**
 * Lee la configuración del CMS en el momento del envío (sin caché: un cambio
 * en /admin se aplica a la siguiente solicitud, sin deploy). Lee con
 * service_role porque la tabla es solo-admin (RLS) y quien envía el
 * formulario es un visitante anónimo; el resultado nunca sale del servidor.
 * Si la lectura falla (tabla ausente, red, falta la clave) se usan los
 * valores predeterminados: la solicitud no se ve afectada.
 */
export async function loadFormEmailSettings(type: FormType): Promise<ResolvedFormEmailSettings> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("form_email_settings")
      .select("form_key, config")
      .in("form_key", [GLOBAL_FORM_KEY, type]);
    if (error) throw new Error(error.message);

    const { config, global } = resolveSettingsFromRows(type, data as FormEmailRow[]);
    return { config, defaultRecipient: global.defaultRecipient };
  } catch (err) {
    if (!warnedConfig) {
      warnedConfig = true;
      console.error(
        "[email] no se pudo leer la configuración de correos del CMS; se usan los valores predeterminados:",
        err instanceof Error ? err.message : "error desconocido"
      );
    }
    const { config, global } = resolveSettingsFromRows(type, []);
    return { config, defaultRecipient: global.defaultRecipient };
  }
}

async function sendInternal(
  type: FormType,
  submission: FormSubmissionEmail,
  settings: ResolvedFormEmailSettings,
  from: string,
  resend: NonNullable<ReturnType<typeof getResendClient>>
): Promise<{ outcome: SendOutcome; recipients: number }> {
  if (!settings.config.internal.enabled) return { outcome: "skipped", recipients: 0 };

  const recipients = resolveInternalRecipients({
    config: settings.config,
    defaultRecipient: settings.defaultRecipient,
    envRecipient: process.env.EMAIL_NOTIFICATION_TO,
  });
  if (recipients.length === 0) {
    console.warn(`[email] formulario "${type}": sin destinatario configurado, se omite el aviso interno.`);
    return { outcome: "skipped", recipients: 0 };
  }

  const def = FORM_DEFINITIONS[type];
  const { subject, text, html } = buildInternalEmail({
    title: submission.title ?? def.internalTitle,
    subjectPrefix: submission.subjectPrefix ?? def.internalSubject,
    summary: sanitizeInline(submission.visitorName) || "sin nombre",
    fields: submission.fields,
    note: submission.note,
    cmsUrl: `${SITE_URL}${def.adminPath}`,
  });

  try {
    // Un correo por destinatario, enviados en UNA llamada de lote: así nadie
    // ve las direcciones internas de los demás (a diferencia de un `to` con
    // varios) y se respeta el límite de peticiones por segundo de Resend.
    const { error } = await resend.batch.send(
      recipients.map((to) => ({
        from,
        to: [to],
        subject,
        text,
        html,
        // Solo si el visitante dejó correo — nunca un replyTo inventado — y salvo que el
        // formulario lo suprima por privacidad (petición de oración privada).
        ...(submission.visitorEmail && !submission.suppressReplyTo
          ? { replyTo: submission.visitorEmail }
          : {}),
      }))
    );
    if (error) {
      console.error(`[email] formulario "${type}": falló el aviso interno:`, error.message);
      return { outcome: "error", recipients: recipients.length };
    }
    return { outcome: "sent", recipients: recipients.length };
  } catch (err) {
    console.error(
      `[email] formulario "${type}": excepción en el aviso interno:`,
      err instanceof Error ? err.message : "error desconocido"
    );
    return { outcome: "error", recipients: recipients.length };
  }
}

async function sendAutoReply(
  type: FormType,
  submission: FormSubmissionEmail,
  settings: ResolvedFormEmailSettings,
  from: string,
  resend: NonNullable<ReturnType<typeof getResendClient>>
): Promise<SendOutcome> {
  const { autoReply } = settings.config;
  if (!autoReply.enabled) return "skipped";
  // Sin correo del visitante no hay a quién responder — y nunca se vuelve obligatorio.
  if (!submission.visitorEmail) return "skipped";

  const defaults = FORM_DEFINITIONS[type].defaultAutoReply;
  // Un asunto o mensaje vacío con la respuesta activa no debería existir (el CMS no lo deja
  // guardar), pero nunca se envía un correo en blanco: se cae al texto predeterminado.
  const { subject, text, html } = buildAutoReplyEmail(
    {
      subject: autoReply.subject.trim() === "" ? defaults.subject : autoReply.subject,
      message: autoReply.message.trim() === "" ? defaults.message : autoReply.message,
    },
    { nombre: submission.visitorName }
  );

  try {
    const { error } = await resend.emails.send({ from, to: submission.visitorEmail, subject, text, html });
    if (error) {
      console.error(`[email] formulario "${type}": falló la respuesta automática:`, error.message);
      return "error";
    }
    return "sent";
  } catch (err) {
    console.error(
      `[email] formulario "${type}": excepción en la respuesta automática:`,
      err instanceof Error ? err.message : "error desconocido"
    );
    return "error";
  }
}

export interface SendFormNotificationsInput {
  formType: FormType;
  submission: FormSubmissionEmail;
  /** Solo para pruebas: configuración ya resuelta. Por defecto se lee del CMS en cada envío. */
  config?: ResolvedFormEmailSettings;
}

export async function sendFormNotifications({
  formType,
  submission,
  config,
}: SendFormNotificationsInput): Promise<FormNotificationsResult> {
  try {
    const resend = getResendClient();
    const from = getEmailFrom();
    if (!isEmailConfigured() || !resend || !from) {
      return { internal: "not_configured", visitor: "not_configured", internalRecipients: 0 };
    }

    const settings = config ?? (await loadFormEmailSettings(formType));

    const [internal, visitor] = await Promise.allSettled([
      sendInternal(formType, submission, settings, from, resend),
      sendAutoReply(formType, submission, settings, from, resend),
    ]);

    return {
      internal: internal.status === "fulfilled" ? internal.value.outcome : "error",
      internalRecipients: internal.status === "fulfilled" ? internal.value.recipients : 0,
      visitor: visitor.status === "fulfilled" ? visitor.value : "error",
    };
  } catch (err) {
    console.error(
      `[email] formulario "${formType}": fallo inesperado, la solicitud ya estaba guardada:`,
      err instanceof Error ? err.message : "error desconocido"
    );
    return { internal: "error", visitor: "error", internalRecipients: 0 };
  }
}
