import { describe, expect, it } from "vitest";
import { aboutContentSchema } from "@/lib/validations/about";

const base = {
  historyEyebrow: "Nuestra historia",
  historyTitle: "FE QUE CONECTA",
  historyText: "Texto de historia.",
  purposeEyebrow: "Nuestro propósito",
  purposeTitle: "Existimos con un propósito",
  missionTitle: "Misión",
  missionHeadline: "Presentar a Jesús",
  missionText: "Texto de misión.",
  visionTitle: "Visión",
  visionHeadline: "Una iglesia movida por el Espíritu Santo",
  visionText: "Texto de visión.",
  essenceTitle: "Amamos a Dios.",
  essenceText: "Texto.",
  valuesEyebrow: "Lo que nos mueve",
  valuesTitle: "Nuestros valores",
  values: [{ title: "SANTIDAD", description: "Texto.", visible: true }],
  beliefsEyebrow: "Lo que creemos",
  beliefsTitle: "Nuestra fe",
  beliefsIntro: "Intro.",
  beliefs: [{ category: "Santa Cena", content: "Creemos en la santa cena del Señor.", visible: true }],
  visitEyebrow: "Queremos conocerte",
  visitTitle: "Tu lugar",
  ctaTitle: "No tienes que hacer este camino solo.",
  ctaText: "Hay una familia esperando conocerte.",
};

describe("aboutContentSchema — valores", () => {
  it("acepta un valor con título y descripción", () => {
    expect(aboutContentSchema.safeParse(base).success).toBe(true);
  });

  it("acepta un valor con descripción vacía (la descripción es opcional)", () => {
    const result = aboutContentSchema.safeParse({
      ...base,
      values: [{ title: "SANTIDAD", description: "", visible: true }],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.values[0].description).toBe("");
  });

  it("una descripción vacía en UN valor no invalida el resto del formulario", () => {
    const result = aboutContentSchema.safeParse({
      ...base,
      values: [
        { title: "A", description: "con texto", visible: true },
        { title: "B", description: "", visible: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("sigue exigiendo título en cada valor", () => {
    const result = aboutContentSchema.safeParse({
      ...base,
      values: [{ title: "  ", description: "texto", visible: true }],
    });
    expect(result.success).toBe(false);
  });
});

describe("aboutContentSchema — creencias", () => {
  it("respeta exactamente el texto editado de una creencia (no lo normaliza ni lo sustituye)", () => {
    const result = aboutContentSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.beliefs[0].category).toBe("Santa Cena");
      expect(result.data.beliefs[0].content).toBe("Creemos en la santa cena del Señor.");
    }
  });
});
