import type { Resend } from "resend";
import { SITE_URL } from "@/lib/constants";
import { CONTACT_REASON_LABEL, PREFERRED_CHANNEL_LABEL } from "@/lib/constants-admin";
import { getEmailFrom, getResendClient, isEmailConfigured } from "@/lib/email/resend";

export interface ContactEmailData {
  name: string;
  reason: string;
  phone: string;
  email?: string;
  preferredChannel: string;
  message: string;
}

type SendOutcome = "sent" | "skipped" | "not_configured" | "error";

export interface ContactNotificationsResult {
  internal: SendOutcome;
  visitor: SendOutcome;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildInternalEmail(data: ContactEmailData) {
  const reasonLabel = CONTACT_REASON_LABEL[data.reason] ?? data.reason;
  const channelLabel = PREFERRED_CHANNEL_LABEL[data.preferredChannel] ?? data.preferredChannel;
  const emailDisplay = data.email || "No proporcionado";
  const cmsUrl = `${SITE_URL}/admin/formularios`;

  const text = [
    "NUEVO CONTACTO RECIBIDO",
    "",
    `Nombre: ${data.name}`,
    "",
    `Motivo: ${reasonLabel}`,
    "",
    `Teléfono / WhatsApp: ${data.phone}`,
    "",
    `Correo: ${emailDisplay}`,
    "",
    `Prefiere que lo contacten por: ${channelLabel}`,
    "",
    `Mensaje: ${data.message}`,
    "",
    "Esta solicitud quedó registrada en el CMS de Inspira Church.",
    cmsUrl,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">Nuevo contacto recibido</h2>
      <p><strong>Nombre:</strong><br>${escapeHtml(data.name)}</p>
      <p><strong>Motivo:</strong><br>${escapeHtml(reasonLabel)}</p>
      <p><strong>Teléfono / WhatsApp:</strong><br>${escapeHtml(data.phone)}</p>
      <p><strong>Correo:</strong><br>${escapeHtml(emailDisplay)}</p>
      <p><strong>Prefiere que lo contacten por:</strong><br>${escapeHtml(channelLabel)}</p>
      <p><strong>Mensaje:</strong><br>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 13px;">
        Esta solicitud quedó registrada en el CMS de Inspira Church.<br>
        <a href="${cmsUrl}">${cmsUrl}</a>
      </p>
    </div>
  `.trim();

  return { subject: `Nuevo contacto desde inspirachurch.co — ${data.name}`, text, html };
}

function buildVisitorEmail(data: ContactEmailData) {
  const text = [
    `Hola, ${data.name}.`,
    "",
    "Gracias por comunicarte con Inspira Church.",
    "",
    "Hemos recibido tu mensaje y uno de nuestros servidores se pondrá en contacto contigo lo antes posible.",
    "",
    "Dios te bendiga.",
    "",
    "Inspira Church",
    SITE_URL,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.6;">
      <p>Hola, ${escapeHtml(data.name)}.</p>
      <p>Gracias por comunicarte con Inspira Church.</p>
      <p>Hemos recibido tu mensaje y uno de nuestros servidores se pondrá en contacto contigo lo antes posible.</p>
      <p>Dios te bendiga.</p>
      <p>
        Inspira Church<br>
        <a href="${SITE_URL}">${SITE_URL}</a>
      </p>
    </div>
  `.trim();

  return { subject: "Recibimos tu mensaje | Inspira Church", text, html };
}

async function sendInternalEmail(
  resend: Resend,
  from: string,
  to: string | null,
  data: ContactEmailData
): Promise<SendOutcome> {
  if (!to) return "skipped";
  const { subject, text, html } = buildInternalEmail(data);
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
      // Solo si el visitante dejó correo — nunca un replyTo inventado.
      ...(data.email ? { replyTo: data.email } : {}),
    });
    if (error) {
      console.error("[email] fallo enviando aviso interno de contacto:", error.message);
      return "error";
    }
    return "sent";
  } catch (err) {
    console.error(
      "[email] excepción enviando aviso interno de contacto:",
      err instanceof Error ? err.message : err
    );
    return "error";
  }
}

async function sendVisitorEmail(
  resend: Resend,
  from: string,
  data: ContactEmailData
): Promise<SendOutcome> {
  if (!data.email) return "skipped";
  const { subject, text, html } = buildVisitorEmail(data);
  try {
    const { error } = await resend.emails.send({ from, to: data.email, subject, text, html });
    if (error) {
      console.error("[email] fallo enviando confirmación al visitante:", error.message);
      return "error";
    }
    return "sent";
  } catch (err) {
    console.error(
      "[email] excepción enviando confirmación al visitante:",
      err instanceof Error ? err.message : err
    );
    return "error";
  }
}

/**
 * Se llama SIEMPRE después de un insert ya exitoso en `contacts` — nunca
 * puede revertirlo ni impedirlo, y nunca lanza. Cada envío atrapa su propio
 * error de forma independiente (Promise.allSettled): el fallo de uno no
 * afecta al otro. El resultado es solo para logs/tests — nunca se muestra
 * al visitante, cuyo éxito ya quedó definido por el insert en Supabase.
 *
 * `data.reason`/`data.preferredChannel` ya vienen validados por
 * contactSchema (Zod), y `consent` es obligatorio en ese mismo schema para
 * cualquier envío que llegue aquí — no hace falta revalidarlo.
 */
export async function sendContactNotifications(
  data: ContactEmailData,
  opts: { internalTo: string | null }
): Promise<ContactNotificationsResult> {
  if (!isEmailConfigured()) {
    return { internal: "not_configured", visitor: "not_configured" };
  }

  const resend = getResendClient();
  const from = getEmailFrom();
  if (!resend || !from) {
    return { internal: "not_configured", visitor: "not_configured" };
  }

  const [internal, visitor] = await Promise.allSettled([
    sendInternalEmail(resend, from, opts.internalTo, data),
    sendVisitorEmail(resend, from, data),
  ]);

  return {
    internal: internal.status === "fulfilled" ? internal.value : "error",
    visitor: visitor.status === "fulfilled" ? visitor.value : "error",
  };
}
