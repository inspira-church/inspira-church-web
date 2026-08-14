import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const growthGroupSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre."),
  slug: z
    .string()
    .trim()
    .min(1, "Ingresa el slug.")
    .regex(slugPattern, "Solo minúsculas, números y guiones (sin espacios ni acentos)."),
  groupType: z.string().trim().min(1, "Ingresa el tipo de grupo."),
  description: z.string().trim().max(1000, "Máximo 1000 caracteres.").optional(),

  // Público (aproximado)
  city: z.string().trim().min(1, "Ingresa la ciudad."),
  locality: z.string().trim().optional(),
  sector: z.string().trim().optional(),
  latApprox: z.coerce.number().min(-90).max(90).optional(),
  lngApprox: z.coerce.number().min(-180).max(180).optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  timeOfDay: z.string().trim().min(1, "Ingresa la hora."),

  leaderId: z.string().trim().optional(),
  coleaderId: z.string().trim().optional(),

  // Privado — solo visible en el panel
  exactAddress: z.string().trim().max(300).optional(),
  leaderPhonePrivate: z.string().trim().max(30).optional(),
  internalNotes: z.string().trim().max(1000).optional(),

  active: z.boolean().default(true),
});

export type GrowthGroupInput = z.infer<typeof growthGroupSchema>;
