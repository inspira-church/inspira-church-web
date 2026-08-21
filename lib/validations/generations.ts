import { z } from "zod";

const areaGroupSchema = z.object({
  label: z.string().trim().optional().default(""),
  age: z.string().trim().min(1, "Ingresa la edad."),
  when: z.string().trim().min(1, "Ingresa el horario."),
  practice: z.string().trim().optional().default(""),
});

const areaSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, "Ingresa el nombre del área."),
  tags: z.string().trim().min(1, "Ingresa las etiquetas."),
  purpose: z.string().trim().min(1, "Ingresa el propósito."),
  groups: z.array(areaGroupSchema).min(1, "Ingresa al menos un horario."),
});

const journeyStepSchema = z.object({
  title: z.string().trim().min(1, "Ingresa el título."),
  when: z.string().trim().optional().default(""),
  text: z.string().trim().min(1, "Ingresa el texto."),
});

const rhythmWordSchema = z.object({
  word: z.string().trim().min(1, "Ingresa la palabra."),
  text: z.string().trim().min(1, "Ingresa el texto."),
});

const faqItemSchema = z.object({
  q: z.string().trim().min(1, "Ingresa la pregunta."),
  a: z.string().trim().min(1, "Ingresa la respuesta."),
});

export const generationsContentSchema = z.object({
  heroEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  heroTitle: z.string().trim().min(1, "Ingresa el título."),
  heroTaglineWhite: z.string().trim().min(1, "Ingresa la primera parte de la frase."),
  heroTaglineCoral: z.string().trim().min(1, "Ingresa la segunda parte de la frase."),
  heroVerseText: z.string().trim().min(1, "Ingresa el versículo."),
  heroVerseRef: z.string().trim().min(1, "Ingresa la referencia."),

  visionTitleWhite1: z.string().trim().min(1, "Ingresa el texto."),
  visionTitleCoral1: z.string().trim().min(1, "Ingresa el texto."),
  visionTitleWhite2: z.string().trim().min(1, "Ingresa el texto."),
  visionTitleCoral2: z.string().trim().min(1, "Ingresa el texto."),
  visionText: z.string().trim().min(1, "Ingresa el texto."),
  visionClosing: z.string().trim().min(1, "Ingresa el texto."),

  legacyTitleWhite: z.string().trim().min(1, "Ingresa el título."),
  legacyTitleCoral: z.string().trim().min(1, "Ingresa el título."),

  areasTitle: z.string().trim().min(1, "Ingresa el título."),
  areasIntro: z.string().trim().min(1, "Ingresa la introducción."),
  areas: z.array(areaSchema).min(1, "Ingresa al menos un área."),

  journeyTitle: z.string().trim().min(1, "Ingresa el título."),
  journey: z.array(journeyStepSchema).min(1, "Ingresa al menos un paso."),

  ratioLeftPercent: z.string().trim().min(1),
  ratioLeftLabel: z.string().trim().min(1, "Ingresa la etiqueta."),
  ratioLeftText: z.string().trim().min(1, "Ingresa el texto."),
  ratioRightPercent: z.string().trim().min(1),
  ratioRightLabel: z.string().trim().min(1, "Ingresa la etiqueta."),
  ratioRightText: z.string().trim().min(1, "Ingresa el texto."),
  ratioClosingFaded: z.string().trim().min(1, "Ingresa el texto."),
  ratioClosingWhite: z.string().trim().min(1, "Ingresa el texto."),

  altarTitle: z.string().trim().min(1, "Ingresa el título."),
  altarText: z.string().trim().min(1, "Ingresa el texto."),
  altarTagline: z.string().trim().min(1, "Ingresa la frase."),

  familiesTitle: z.string().trim().min(1, "Ingresa el título."),
  familiesText: z.string().trim().min(1, "Ingresa el texto."),
  parentsGuideUrl: z.string().trim().optional().default(""),

  nextDateEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  nextDate: z.string().trim().optional().default(""),
  nextDateNote: z.string().trim().optional().default(""),

  rhythm: z.array(rhythmWordSchema).min(1, "Ingresa al menos una palabra."),

  safetyEyebrow: z.string().trim().min(1, "Ingresa el texto pequeño."),
  safetyTitle: z.string().trim().min(1, "Ingresa el título."),
  safetyPrinciples: z.array(z.string().trim().min(1)).min(1, "Ingresa al menos un principio."),
  careGuidelinesUrl: z.string().trim().optional().default(""),

  faqTitle: z.string().trim().min(1, "Ingresa el título."),
  faq: z.array(faqItemSchema).min(1, "Ingresa al menos una pregunta."),

  ctaTitle: z.string().trim().min(1, "Ingresa el título."),
  ctaTagline: z.string().trim().min(1, "Ingresa la frase."),
  ctaClosing: z.string().trim().min(1, "Ingresa el texto."),
});

export type GenerationsContentInput = z.infer<typeof generationsContentSchema>;
