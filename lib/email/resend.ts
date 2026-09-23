import { Resend } from "resend";

/**
 * Server-only por construcción: este módulo solo lo importa lib/email/
 * contact-emails.ts, que a su vez solo lo importa lib/actions/contact.ts
 * ("use server"). Nunca se referencia desde un Client Component, así que
 * Next.js nunca lo incluye en el bundle del navegador — mismo criterio que
 * lib/supabase/admin.ts (service_role) para módulos con credenciales.
 */

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

let warned = false;
function warnNotConfiguredOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[email] RESEND_API_KEY o EMAIL_FROM no están configuradas — las notificaciones de contacto se omiten. Configúralas en .env.local antes de producción."
  );
}

let client: Resend | null = null;

/** null si RESEND_API_KEY no está configurada — el llamador debe manejar ese caso, nunca lanzar. */
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV !== "production") warnNotConfiguredOnce();
    return null;
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/** "Inspira Church <notificaciones@inspirachurch.co>" — el valor real se configura en Vercel, nunca hardcodeado aquí. */
export function getEmailFrom(): string | null {
  return process.env.EMAIL_FROM || null;
}
