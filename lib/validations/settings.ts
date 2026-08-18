import { z } from "zod";

export const siteSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Ingresa el número en formato internacional, solo dígitos (ej: 573001234567)."),
  whatsappMessage: z.string().trim().min(1, "Ingresa un mensaje por defecto."),
  facebookUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  tiktokUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  xUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  privacyPolicyUrl: z.string().trim().url("Ingresa una URL válida.").optional().or(z.literal("")),
  churchAddress: z.string().trim().max(300).optional(),
  churchLat: z.coerce.number().min(-90).max(90).optional(),
  churchLng: z.coerce.number().min(-180).max(180).optional(),
  youtubeChannelId: z
    .string()
    .trim()
    .regex(/^UC[\w-]{22}$/, "El Channel ID empieza con \"UC\" y tiene 24 caracteres.")
    .optional()
    .or(z.literal("")),
  heroText1: z.string().trim().min(1, "Ingresa el primer texto del hero.").max(200),
  heroText2: z.string().trim().min(1, "Ingresa el segundo texto del hero.").max(200),
  firstTimeHeroText: z
    .string()
    .trim()
    .min(1, "Ingresa el texto del hero de \"Primera vez\".")
    .max(300),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
