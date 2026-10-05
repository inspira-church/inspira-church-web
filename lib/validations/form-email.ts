import { z } from "zod";
import { MAX_ADDITIONAL_RECIPIENTS } from "@/lib/email/form-config";
import { findUnsupportedPlaceholders } from "@/lib/email/form-templates";

const email = z.string().trim().max(254, "Correo demasiado largo.").email("Correo no válido.");

function unsupportedMessage(text: string): string | null {
  const bad = findUnsupportedPlaceholders(text);
  if (bad.length === 0) return null;
  return `Variable no permitida: ${bad.join(", ")}. Solo se puede usar {{nombre}}.`;
}

export const formEmailConfigSchema = z
  .object({
    internalEnabled: z.boolean(),
    useDefaultRecipient: z.boolean(),
    /** "" es válido (el campo vacío): solo se exige cuando NO se usa el predeterminado. */
    primary: z.string().trim().max(254, "Correo demasiado largo."),
    /** El formulario ya descartó las filas vacías: aquí solo llegan direcciones escritas. */
    additional: z.array(z.string().trim()).max(MAX_ADDITIONAL_RECIPIENTS, `Máximo ${MAX_ADDITIONAL_RECIPIENTS} correos adicionales.`),
    autoReplyEnabled: z.boolean(),
    autoReplySubject: z.string().trim().max(150, "Máximo 150 caracteres."),
    autoReplyMessage: z.string().trim().max(3000, "Máximo 3000 caracteres."),
  })
  .superRefine((data, ctx) => {
    // ── Principal propio ──
    if (!data.useDefaultRecipient) {
      if (data.primary === "") {
        ctx.addIssue({
          code: "custom",
          path: ["primary"],
          message: "Escribe el correo principal o marca «Usar el correo administrativo predeterminado».",
        });
      } else if (!email.safeParse(data.primary).success) {
        ctx.addIssue({ code: "custom", path: ["primary"], message: "Correo no válido." });
      }
    }

    // ── Adicionales: válidos, sin repetir entre sí ni al principal propio ──
    const seen = new Set<string>();
    const principal = !data.useDefaultRecipient ? data.primary.toLowerCase() : null;
    for (const raw of data.additional) {
      if (!email.safeParse(raw).success) {
        ctx.addIssue({ code: "custom", path: ["additional"], message: `Correo adicional no válido: ${raw}` });
        break;
      }
      const key = raw.toLowerCase();
      if (principal && key === principal) {
        ctx.addIssue({
          code: "custom",
          path: ["additional"],
          message: `${raw} ya es el correo principal; no lo repitas como adicional.`,
        });
        break;
      }
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["additional"], message: `Correo repetido: ${raw}` });
        break;
      }
      seen.add(key);
    }

    // ── Respuesta automática ──
    if (data.autoReplyEnabled) {
      if (data.autoReplySubject === "") {
        ctx.addIssue({ code: "custom", path: ["autoReplySubject"], message: "Escribe el asunto de la respuesta." });
      }
      if (data.autoReplyMessage === "") {
        ctx.addIssue({ code: "custom", path: ["autoReplyMessage"], message: "Escribe el mensaje de la respuesta." });
      }
    }
    if (/[\r\n]/.test(data.autoReplySubject)) {
      ctx.addIssue({ code: "custom", path: ["autoReplySubject"], message: "El asunto debe ir en una sola línea." });
    }
    const badSubject = unsupportedMessage(data.autoReplySubject);
    if (badSubject) ctx.addIssue({ code: "custom", path: ["autoReplySubject"], message: badSubject });
    const badMessage = unsupportedMessage(data.autoReplyMessage);
    if (badMessage) ctx.addIssue({ code: "custom", path: ["autoReplyMessage"], message: badMessage });
  });

export type FormEmailConfigInput = z.infer<typeof formEmailConfigSchema>;

export const globalFormEmailSchema = z.object({
  /** "" es válido: sin predeterminado se usa EMAIL_NOTIFICATION_TO del servidor. */
  defaultRecipient: z.union([z.literal(""), email]),
});
