import { FORM_DEFINITIONS, FORM_TYPES, type FormType } from "@/lib/email/form-definitions";

/**
 * Configuración de correo de UN formulario, editable desde el CMS. El
 * remitente (EMAIL_FROM) NO está aquí a propósito: se controla solo desde las
 * variables de entorno de Vercel. El CMS únicamente decide destinatarios y
 * contenido.
 */
export interface FormEmailConfig {
  internal: {
    /** Notificación al equipo. Independiente de la respuesta automática. */
    enabled: boolean;
    /** true = usar el correo administrativo predeterminado (global) como principal. */
    useDefaultRecipient: boolean;
    /** Principal propio de este formulario; solo cuenta si useDefaultRecipient es false. */
    primary: string;
    /** Destinatarios extra (cada uno recibe su propio correo, sin ver a los demás). */
    additional: string[];
  };
  autoReply: {
    /** Agradecimiento al visitante. Solo se envía si dejó correo. */
    enabled: boolean;
    subject: string;
    message: string;
  };
}

/** Configuración global compartida por todos los formularios. */
export interface GlobalFormEmailSettings {
  /** "Correo administrativo predeterminado". Vacío = se usa EMAIL_NOTIFICATION_TO del servidor. */
  defaultRecipient: string;
}

export const GLOBAL_FORM_KEY = "global" as const;
export const MAX_ADDITIONAL_RECIPIENTS = 10;

/**
 * Valores iniciales seguros: lo que recibe un formulario que todavía no tiene
 * fila guardada. Notificación interna ON hacia el correo predeterminado,
 * respuesta automática ON (todos los formularios públicos aceptan un correo
 * del visitante; si no lo dejó, simplemente no se envía).
 */
export function defaultFormEmailConfig(type: FormType): FormEmailConfig {
  const { subject, message } = FORM_DEFINITIONS[type].defaultAutoReply;
  return {
    internal: { enabled: true, useDefaultRecipient: true, primary: "", additional: [] },
    autoReply: { enabled: true, subject, message },
  };
}

export function defaultGlobalSettings(): GlobalFormEmailSettings {
  return { defaultRecipient: "" };
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Lee lo guardado campo por campo contra los defaults. Un string guardado
 * como "" se respeta tal cual (es una decisión del admin); solo se usa el
 * default cuando el campo NO existe o tiene un tipo inválido — nunca `||`.
 */
export function mergeFormEmailConfig(type: FormType, stored: unknown): FormEmailConfig {
  const base = defaultFormEmailConfig(type);
  if (!isRecord(stored)) return base;

  const internal = isRecord(stored.internal) ? stored.internal : {};
  const autoReply = isRecord(stored.autoReply) ? stored.autoReply : {};

  return {
    internal: {
      enabled: typeof internal.enabled === "boolean" ? internal.enabled : base.internal.enabled,
      useDefaultRecipient:
        typeof internal.useDefaultRecipient === "boolean"
          ? internal.useDefaultRecipient
          : base.internal.useDefaultRecipient,
      primary: typeof internal.primary === "string" ? internal.primary : base.internal.primary,
      additional: Array.isArray(internal.additional)
        ? internal.additional.filter((e): e is string => typeof e === "string")
        : base.internal.additional,
    },
    autoReply: {
      enabled: typeof autoReply.enabled === "boolean" ? autoReply.enabled : base.autoReply.enabled,
      subject: typeof autoReply.subject === "string" ? autoReply.subject : base.autoReply.subject,
      message: typeof autoReply.message === "string" ? autoReply.message : base.autoReply.message,
    },
  };
}

export function mergeGlobalSettings(stored: unknown): GlobalFormEmailSettings {
  const base = defaultGlobalSettings();
  if (!isRecord(stored)) return base;
  return {
    defaultRecipient:
      typeof stored.defaultRecipient === "string" ? stored.defaultRecipient : base.defaultRecipient,
  };
}

export interface FormEmailRow {
  form_key: string;
  config: unknown;
}

/** Arma la configuración efectiva de un formulario a partir de las filas guardadas (cualquier subconjunto). */
export function resolveSettingsFromRows(
  type: FormType,
  rows: FormEmailRow[] | null | undefined
): { config: FormEmailConfig; global: GlobalFormEmailSettings } {
  const list = rows ?? [];
  return {
    config: mergeFormEmailConfig(type, list.find((r) => r.form_key === type)?.config),
    global: mergeGlobalSettings(list.find((r) => r.form_key === GLOBAL_FORM_KEY)?.config),
  };
}

/** Todas las configuraciones (para el CMS), con defaults donde no hay fila. */
export function resolveAllSettings(rows: FormEmailRow[] | null | undefined) {
  return {
    global: resolveSettingsFromRows(FORM_TYPES[0], rows).global,
    forms: Object.fromEntries(
      FORM_TYPES.map((t) => [t, resolveSettingsFromRows(t, rows).config])
    ) as Record<FormType, FormEmailConfig>,
  };
}
