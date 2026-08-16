import { z } from "zod";

const valueItemSchema = z.object({
  title: z.string().trim().min(1, "Ingresa un título."),
  description: z.string().trim().min(1, "Ingresa una descripción."),
});

export const aboutContentSchema = z.object({
  historyEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  historyTitle: z.string().trim().min(1, "Ingresa el título."),
  historyText: z.string().trim().min(1, "Ingresa el texto."),
  missionTitle: z.string().trim().min(1, "Ingresa el título."),
  missionText: z.string().trim().min(1, "Ingresa el texto."),
  visionTitle: z.string().trim().min(1, "Ingresa el título."),
  visionText: z.string().trim().min(1, "Ingresa el texto."),
  valuesEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  valuesTitle: z.string().trim().min(1, "Ingresa el título."),
  values: z.array(valueItemSchema).length(4, "Se necesitan exactamente 4 valores."),
  beliefsEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  beliefsTitle: z.string().trim().min(1, "Ingresa el título."),
  beliefs: z
    .array(z.string().trim().min(1))
    .min(1, "Ingresa al menos una creencia."),
});

export type AboutContentInput = z.infer<typeof aboutContentSchema>;
