import { z } from "zod";
import type { FormEmailConfig } from "@/lib/email/form-config";

const emailSchema = z.string().email().max(254);

export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}

/**
 * Recorta, descarta vacíos/inválidos y quita duplicados sin distinguir
 * mayúsculas (conserva la primera aparición). Nunca lanza.
 */
export function normalizeEmailList(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const value = raw.trim();
    if (!value || !isValidEmail(value)) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export interface RecipientSources {
  config: FormEmailConfig;
  /** "Correo administrativo predeterminado" del CMS (global). */
  defaultRecipient: string;
  /** Variable de entorno EMAIL_NOTIFICATION_TO: último respaldo de emergencia. */
  envRecipient: string | null | undefined;
}

/**
 * Orden del destinatario PRINCIPAL:
 *   1. el de este formulario (si no usa el predeterminado y escribió uno);
 *   2. el administrativo predeterminado del CMS;
 *   3. EMAIL_NOTIFICATION_TO;
 *   4. ninguno.
 * Los adicionales se suman siempre, sin repetir al principal. Si no hay
 * principal pero sí adicionales, los adicionales igual reciben el aviso.
 */
export function resolveInternalRecipients(sources: RecipientSources): string[] {
  const principal = resolvePrimaryRecipient(sources);
  return normalizeEmailList([...(principal ? [principal] : []), ...sources.config.internal.additional]);
}

/**
 * Solo el destinatario PRINCIPAL (mismo orden de prioridad que arriba), o null
 * si ninguno existe. Es el ÚNICO destinatario de los avisos de contenido
 * restringido (una petición de oración privada): nunca los adicionales, ni
 * cuando no hay principal — en ese caso el aviso simplemente no se envía.
 */
export function resolvePrimaryRecipient({ config, defaultRecipient, envRecipient }: RecipientSources): string | null {
  const { useDefaultRecipient, primary } = config.internal;

  const candidates = [useDefaultRecipient ? "" : primary, defaultRecipient, envRecipient ?? ""];
  return candidates.map((c) => c.trim()).find((c) => c && isValidEmail(c)) ?? null;
}
