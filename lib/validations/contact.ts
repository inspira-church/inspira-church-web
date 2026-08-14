import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre."),
  email: z.string().trim().email("Correo inválido.").optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  reason: z.enum(["visitar", "grupo", "oracion", "informacion", "servir", "otro"], {
    message: "Selecciona un motivo.",
  }),
  message: z.string().trim().max(2000, "Máximo 2000 caracteres.").optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de datos.",
  }),
});
