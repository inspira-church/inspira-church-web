import { SITE_URL } from "@/lib/constants";

/**
 * Plantillas de correo. NO es un motor de plantillas: el único mecanismo es
 * reemplazar la variable literal `{{nombre}}`. No hay expresiones, código,
 * acceso al servidor ni HTML: el CMS edita texto plano y aquí se escapa y se
 * convierte a HTML seguro. Para permitir otra variable en el futuro hay que
 * agregarla a ALLOWED_VARIABLES y a `renderTemplate` explícitamente.
 */

export const ALLOWED_VARIABLES = ["nombre"] as const;

const PLACEHOLDER = /\{\{[^{}]*\}\}/g;
const NOMBRE = /\{\{\s*nombre\s*\}\}/gi;

/** Variables `{{…}}` que NO están permitidas — el CMS las rechaza al guardar. */
export function findUnsupportedPlaceholders(text: string): string[] {
  const found = text.match(PLACEHOLDER) ?? [];
  return [...new Set(found.filter((token) => !new RegExp(`^${NOMBRE.source}$`, "i").test(token)))];
}

// Caracteres de control y separadores de línea Unicode (U+2028/U+2029), construidos por código de
// carácter para no depender de cómo el editor guarde esos caracteres invisibles.
const CONTROL_CHARS = new RegExp("[\\x00-\\x1f\\x7f" + String.fromCharCode(0x2028, 0x2029) + "]+", "g");

/** Una sola línea, sin caracteres de control — apto para insertarse en un asunto sin permitir inyección de cabeceras. */
export function sanitizeInline(value: string | null | undefined, max = 80): string {
  return (value ?? "")
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Sustituye `{{nombre}}`. Sin nombre usa un saludo neutro: se quita la
 * variable junto con el espacio que la precede ("Hola {{nombre}}," → "Hola,").
 */
export function renderTemplate(template: string, vars: { nombre?: string | null }): string {
  const nombre = sanitizeInline(vars.nombre);
  if (nombre) return template.replace(NOMBRE, nombre);
  return template.replace(/[ \t]*\{\{\s*nombre\s*\}\}/gi, "");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Texto plano → HTML: párrafos por línea en blanco, saltos simples como <br>. Todo escapado. */
export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin: 0 0 14px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

const WRAPPER_STYLE = "font-family: sans-serif; font-size: 15px; color: #111; line-height: 1.6;";

export interface EmailField {
  label: string;
  /** null / vacío = el campo no se muestra. */
  value: string | null;
}

export interface InternalEmailInput {
  title: string;
  subjectPrefix: string;
  /** Normalmente el nombre del visitante: va al final del asunto. */
  summary: string;
  fields: EmailField[];
  /** Aviso extra bajo los campos (ej. "el texto de una petición privada no se incluye"). */
  note?: string | null;
  cmsUrl: string;
}

export function buildInternalEmail(input: InternalEmailInput) {
  const fields = input.fields.filter((f) => f.value !== null && f.value.trim() !== "");
  const subject = sanitizeInline(`${input.subjectPrefix} — ${input.summary}`, 150);

  const text = [
    input.title,
    "",
    ...fields.flatMap((f) => [`${f.label}: ${f.value}`, ""]),
    ...(input.note ? [input.note, ""] : []),
    "Esta solicitud quedó registrada en el CMS de Inspira Church.",
    input.cmsUrl,
  ].join("\n");

  const html = `
    <div style="${WRAPPER_STYLE}">
      <h2 style="margin: 0 0 16px;">${escapeHtml(input.title)}</h2>
      ${fields
        .map(
          (f) =>
            `<p style="margin: 0 0 12px;"><strong>${escapeHtml(f.label)}:</strong><br>${escapeHtml(f.value ?? "").replace(/\n/g, "<br>")}</p>`
        )
        .join("\n      ")}
      ${input.note ? `<p style="margin: 0 0 12px; color: #444;"><em>${escapeHtml(input.note)}</em></p>` : ""}
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 13px;">
        Esta solicitud quedó registrada en el CMS de Inspira Church.<br>
        <a href="${escapeHtml(input.cmsUrl)}">${escapeHtml(input.cmsUrl)}</a>
      </p>
    </div>
  `.trim();

  return { subject, text, html };
}

export interface RestrictedNoticeInput {
  /** Asunto exacto (sin datos del visitante). */
  subject: string;
  /** Una frase que dice qué ocurrió, sin datos del visitante. */
  headline: string;
  cmsUrl: string;
}

/**
 * Aviso interno MÍNIMO para contenido restringido: no incluye ningún dato del
 * visitante (ni nombre) ni campos del formulario; solo que llegó algo y dónde
 * consultarlo con la sesión autorizada del CMS.
 */
export function buildRestrictedNoticeEmail(input: RestrictedNoticeInput) {
  const registered = "La solicitud quedó registrada en el CMS de Inspira Church.";

  const text = [input.headline, "", registered, "", "Consultar:", input.cmsUrl].join("\n");
  const html = `
    <div style="${WRAPPER_STYLE}">
      <p style="margin: 0 0 14px;">${escapeHtml(input.headline)}</p>
      <p style="margin: 0 0 14px;">${escapeHtml(registered)}</p>
      <p style="margin: 0;">Consultar:<br><a href="${escapeHtml(input.cmsUrl)}">${escapeHtml(input.cmsUrl)}</a></p>
    </div>
  `.trim();

  return { subject: sanitizeInline(input.subject, 150), text, html };
}

export function buildAutoReplyEmail(config: { subject: string; message: string }, vars: { nombre?: string | null }) {
  const subject = sanitizeInline(renderTemplate(config.subject, vars), 150);
  const body = renderTemplate(config.message, vars);

  const text = [body, "", SITE_URL].join("\n");
  const html = `
    <div style="${WRAPPER_STYLE}">
      ${textToHtml(body)}
      <p style="margin: 18px 0 0; color: #666; font-size: 13px;"><a href="${escapeHtml(SITE_URL)}">${escapeHtml(SITE_URL)}</a></p>
    </div>
  `.trim();

  return { subject, text, html };
}
