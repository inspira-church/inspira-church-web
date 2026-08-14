import { z } from "zod";

export const prayerRequestSchema = z.object({
  name: z.string().trim().min(1, "Ingresa tu nombre."),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Correo inválido.").optional(),
  requestText: z.string().trim().min(1, "Cuéntanos tu petición."),
  isPrivate: z.boolean().default(false),
  consent: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de datos.",
  }),
});
