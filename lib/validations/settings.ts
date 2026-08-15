import { z } from "zod";

export const siteSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Ingresa el número en formato internacional, solo dígitos (ej: 573001234567)."),
  whatsappMessage: z.string().trim().min(1, "Ingresa un mensaje por defecto."),
  facebookUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  privacyPolicyUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
