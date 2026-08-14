import { z } from "zod";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const sermonSeriesSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre."),
  slug: z
    .string()
    .trim()
    .min(1, "Ingresa el slug.")
    .regex(slugPattern, "Solo minúsculas, números y guiones (sin espacios ni acentos)."),
  description: z.string().trim().max(1000, "Máximo 1000 caracteres.").optional(),
  coverImageUrl: z.string().trim().optional(),
  active: z.boolean().default(true),
});

export type SermonSeriesInput = z.infer<typeof sermonSeriesSchema>;
