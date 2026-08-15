import { describe, expect, it } from "vitest";
import { sermonSchema } from "@/lib/validations/sermon";

const valid = {
  title: "Fe que mueve montañas",
  slug: "fe-que-mueve-montanas",
  seriesId: "11111111-1111-1111-1111-111111111111",
  preacherId: "22222222-2222-2222-2222-222222222222",
  description: "Una prédica sobre la fe.",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  thumbnailUrl: "https://example.com/thumb.jpg",
  sermonDate: "2026-02-01",
  topics: ["fe", "esperanza"],
  published: true,
} as const;

describe("sermonSchema", () => {
  it("acepta una prédica completa válida", () => {
    expect(sermonSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta un enlace youtu.be", () => {
    expect(
      sermonSchema.safeParse({ ...valid, youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }).success
    ).toBe(true);
  });

  it("acepta un enlace de embed", () => {
    expect(
      sermonSchema.safeParse({
        ...valid,
        youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      }).success
    ).toBe(true);
  });

  it("rechaza un enlace que no es de YouTube", () => {
    expect(
      sermonSchema.safeParse({ ...valid, youtubeUrl: "https://vimeo.com/12345" }).success
    ).toBe(false);
  });

  it("rechaza un slug inválido", () => {
    expect(sermonSchema.safeParse({ ...valid, slug: "Fe Que Mueve Montañas" }).success).toBe(
      false
    );
  });

  it("topics por defecto es un arreglo vacío si se omite", () => {
    const rest = {
      title: valid.title,
      slug: valid.slug,
      youtubeUrl: valid.youtubeUrl,
      sermonDate: valid.sermonDate,
    };
    const result = sermonSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.topics).toEqual([]);
  });
});
