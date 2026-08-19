import { z } from "zod";

export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa tu nombre.").max(120, "Nombre demasiado largo."),
    email: z.string().trim().email("Ingresa un correo válido.").optional(),
    phone: z.string().trim().min(1, "Ingresa un número de contacto."),
    preferredChannel: z.enum(["whatsapp", "llamada", "correo"], {
      message: "Selecciona cómo prefieres que te contactemos.",
    }),
    reason: z.enum(["visitar", "grupo", "oracion", "informacion", "servir", "evento", "otro"], {
      message: "Selecciona un motivo.",
    }),
    message: z.string().trim().min(1, "Cuéntanos un poco más.").max(2000, "Máximo 2000 caracteres."),
    consent: z.boolean().refine((v) => v === true, {
      message: "Debes autorizar el tratamiento de datos.",
    }),
    /** Slug del evento de origen (/contacto?evento=<slug>) — el id real se resuelve en el servidor, nunca se confía en uno enviado desde el cliente. */
    eventSlug: z.string().trim().optional(),
  })
  .refine((data) => data.preferredChannel !== "correo" || Boolean(data.email), {
    message: "Ingresa un correo electrónico para poder escribirte.",
    path: ["email"],
  });

export type ContactInput = z.infer<typeof contactSchema>;
