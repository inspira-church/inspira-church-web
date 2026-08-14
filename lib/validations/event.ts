import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const eventSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre."),
  slug: z
    .string()
    .trim()
    .min(1, "Ingresa el slug.")
    .regex(slugPattern, "Solo minúsculas, números y guiones (sin espacios ni acentos)."),
  description: z.string().trim().max(2000, "Máximo 2000 caracteres.").optional(),
  imageUrl: z.string().trim().optional(),
  eventDate: z.string().trim().min(1, "Ingresa la fecha."),
  eventTime: z.string().trim().optional(),
  locationName: z.string().trim().optional(),
  address: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  capacity: z.coerce.number().int().positive().optional(),
  registrationUrl: z.string().trim().url("URL inválida.").optional(),
  status: z.enum(["proximo", "finalizado", "cancelado"], { message: "Selecciona un estado." }),
  published: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventSchema>;
