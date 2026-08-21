import { z } from "zod";

export const generationsRegistrationSchema = z.object({
  childFirstName: z.string().trim().min(1, "Ingresa el nombre del niño o joven."),
  childLastName: z.string().trim().min(1, "Ingresa los apellidos."),
  childAge: z.coerce
    .number()
    .int()
    .min(0, "Edad inválida.")
    .max(17, "Este formulario es para menores de edad."),
  childSchool: z.string().trim().optional(),
  allergies: z.string().trim().max(500, "Máximo 500 caracteres.").optional(),
  areaInterest: z.string().trim().optional(),
  guardianName: z.string().trim().min(1, "Ingresa el nombre del padre, madre o acudiente."),
  guardianPhone: z.string().trim().min(1, "Ingresa un teléfono de contacto."),
  guardianEmail: z.string().trim().email("Correo inválido.").optional().or(z.literal("")),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
  dataConsent: z.boolean().refine((v) => v === true, {
    message: "Debes autorizar el tratamiento de datos.",
  }),
  imageConsent: z.boolean().optional().default(false),
});

export type GenerationsRegistrationInput = z.infer<typeof generationsRegistrationSchema>;
