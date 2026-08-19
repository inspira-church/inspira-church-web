import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const practicalInfoItemSchema = z.object({
  title: z.string().trim().min(1, "Ingresa un título."),
  content: z.string().trim().min(1, "Ingresa el contenido."),
});

export const eventSchema = z
  .object({
    name: z.string().trim().min(1, "Ingresa el nombre."),
    subtitle: z.string().trim().optional(),
    slug: z
      .string()
      .trim()
      .min(1, "Ingresa el slug.")
      .regex(slugPattern, "Solo minúsculas, números y guiones (sin espacios ni acentos)."),
    description: z.string().trim().max(2000, "Máximo 2000 caracteres.").optional(),
    imageUrl: z.string().trim().optional(),
    eventDate: z.string().trim().min(1, "Ingresa la fecha."),
    eventTime: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    endTime: z.string().trim().optional(),
    modality: z.enum(["presencial", "virtual", "hibrido"]).default("presencial"),
    locationName: z.string().trim().optional(),
    address: z.string().trim().optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    locationPublic: z.boolean().default(true),
    category: z.string().trim().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    requiresRegistration: z.boolean().default(false),
    registrationUrl: z.string().trim().url("URL inválida.").optional(),
    registrationStatus: z.enum(["abiertas", "ultimos_cupos", "cerradas", "agotado"]).optional(),
    showCountdown: z.boolean().default(false),
    practicalInfo: z.array(practicalInfoItemSchema).default([]),
    cost: z.string().trim().optional(),
    ageRange: z.string().trim().optional(),
    adminStatus: z.enum(["activo", "cancelado"], { message: "Selecciona un estado." }),
    published: z.boolean().default(false),
  })
  .refine((data) => !data.endDate || data.endDate >= data.eventDate, {
    message: "La fecha de finalización no puede ser anterior a la de inicio.",
    path: ["endDate"],
  });

export type EventInput = z.infer<typeof eventSchema>;
