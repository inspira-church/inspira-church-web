import { describe, expect, it } from "vitest";
import { sermonSeriesSchema } from "@/lib/validations/sermon-series";

const valid = {
  name: "Una vida con propósito",
  slug: "una-vida-con-proposito",
  description: "Serie sobre el propósito de vida.",
  coverImageUrl: "https://example.com/portada.jpg",
  active: true,
} as const;

describe("sermonSeriesSchema", () => {
  it("acepta una serie completa válida", () => {
    expect(sermonSeriesSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un slug con acentos o mayúsculas", () => {
    expect(sermonSeriesSchema.safeParse({ ...valid, slug: "Una-Vida-Con-Propósito" }).success).toBe(
      false
    );
  });

  it("rechaza nombre vacío", () => {
    expect(sermonSeriesSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("rechaza descripción de más de 1000 caracteres", () => {
    expect(
      sermonSeriesSchema.safeParse({ ...valid, description: "a".repeat(1001) }).success
    ).toBe(false);
  });
});
