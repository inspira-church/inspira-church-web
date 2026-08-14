import { z } from "zod";

export const groupJoinSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tu nombre."),
  lastName: z.string().trim().min(1, "Ingresa tus apellidos."),
  phone: z.string().trim().min(1, "Ingresa tu teléfono."),
  whatsapp: z.string().trim().optional(),
  email: z.string().trim().email("Correo inválido.").optional(),
  age: z.coerce.number().int().positive().optional(),
  city: z.string().trim().min(1, "Ingresa tu ciudad."),
  locality: z.string().trim().optional(),
  neighborhood: z.string().trim().optional(),
  groupId: z.string().trim().optional(),
  availability: z.string().trim().optional(),
  notes: z.string().trim().max(1000, "Máximo 1000 caracteres.").optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de datos.",
  }),
});
