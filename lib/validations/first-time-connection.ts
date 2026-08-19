import { z } from "zod";

export const firstTimeConnectionSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tu nombre."),
  lastName: z.string().trim().min(1, "Ingresa tu apellido."),
  gender: z.enum(["hombre", "mujer"], { message: "Selecciona una opción." }),
  email: z.string().trim().email("Correo inválido."),
  phone: z.string().trim().min(1, "Ingresa tu número celular."),
  message: z.string().trim().max(200, "Máximo 200 caracteres.").optional(),
  attendsOtherChurch: z.boolean(),
  wantsCall: z.boolean(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de datos.",
  }),
});
