import { z } from "zod";
import { getYouTubeId } from "@/lib/format";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const sermonSchema = z.object({
  title: z.string().trim().min(1, "Ingresa el título."),
  slug: z
    .string()
    .trim()
    .min(1, "Ingresa el slug.")
    .regex(slugPattern, "Solo minúsculas, números y guiones (sin espacios ni acentos)."),
  seriesId: z.string().trim().optional(),
  preacherId: z.string().trim().optional(),
  description: z.string().trim().max(2000, "Máximo 2000 caracteres.").optional(),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, "Ingresa el enlace de YouTube.")
    .refine((url) => getYouTubeId(url) !== null, "Ese enlace no parece ser un video de YouTube válido."),
  thumbnailUrl: z.string().trim().optional(),
  sermonDate: z.string().trim().min(1, "Ingresa la fecha."),
  topics: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export type SermonInput = z.infer<typeof sermonSchema>;
