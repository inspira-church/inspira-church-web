import { z } from "zod";

const valueItemSchema = z.object({
  title: z.string().trim().min(1, "Ingresa un título."),
  description: z.string().trim().min(1, "Ingresa una descripción."),
});

const beliefItemSchema = z.object({
  category: z.string().trim().min(1, "Ingresa el nombre de la categoría."),
  content: z.string().trim(),
  visible: z.boolean(),
});

export const aboutContentSchema = z.object({
  historyEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  historyTitle: z.string().trim().min(1, "Ingresa el título."),
  historyText: z.string().trim().min(1, "Ingresa el texto."),
  historyImageAlt: z.string().trim().max(200).optional().default(""),

  purposeEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  purposeTitle: z.string().trim().min(1, "Ingresa el título."),
  missionTitle: z.string().trim().min(1, "Ingresa el título."),
  missionHeadline: z.string().trim().min(1, "Ingresa la frase protagonista."),
  missionText: z.string().trim().min(1, "Ingresa el texto."),
  visionTitle: z.string().trim().min(1, "Ingresa el título."),
  visionHeadline: z.string().trim().min(1, "Ingresa la frase protagonista."),
  visionText: z.string().trim().min(1, "Ingresa el texto."),

  essenceTitle: z.string().trim().min(1, "Ingresa el título."),
  essenceText: z.string().trim().min(1, "Ingresa el texto."),
  essenceImageAlt: z.string().trim().max(200).optional().default(""),

  valuesEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  valuesTitle: z.string().trim().min(1, "Ingresa el título."),
  values: z.array(valueItemSchema).length(4, "Se necesitan exactamente 4 valores."),

  beliefsEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  beliefsTitle: z.string().trim().min(1, "Ingresa el título."),
  beliefsIntro: z.string().trim().min(1, "Ingresa el texto de introducción."),
  beliefs: z.array(beliefItemSchema).min(1, "Ingresa al menos una categoría."),

  visitEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  visitTitle: z.string().trim().min(1, "Ingresa el título."),

  ctaTitle: z.string().trim().min(1, "Ingresa el título."),
  ctaText: z.string().trim().min(1, "Ingresa el texto."),
});

export type AboutContentInput = z.infer<typeof aboutContentSchema>;
