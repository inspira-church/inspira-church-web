import { describe, expect, it } from "vitest";
import { DEFAULT_ABOUT_CONTENT, mergeAboutContent } from "@/lib/queries/about";

describe("mergeAboutContent", () => {
  it("lo guardado gana a los defaults", () => {
    const merged = mergeAboutContent({ historyTitle: "FE QUE CONECTA" });
    expect(merged.historyTitle).toBe("FE QUE CONECTA");
    expect(merged.historyTitle).not.toBe(DEFAULT_ABOUT_CONTENT.historyTitle);
  });

  it("los campos inexistentes en lo guardado se rellenan con el default", () => {
    const merged = mergeAboutContent({ historyTitle: "X" });
    expect(merged.missionTitle).toBe(DEFAULT_ABOUT_CONTENT.missionTitle);
  });

  it("un campo guardado como '' NO se reemplaza por el default", () => {
    const merged = mergeAboutContent({ historyImageAlt: "" });
    expect(merged.historyImageAlt).toBe("");
    expect(DEFAULT_ABOUT_CONTENT.historyImageAlt).not.toBe("");
  });

  it("una descripción de valor guardada vacía se conserva vacía", () => {
    const merged = mergeAboutContent({
      values: [{ title: "SANTIDAD", description: "", visible: true }],
    });
    expect(merged.values).toEqual([{ title: "SANTIDAD", description: "", visible: true }]);
  });

  it("valores guardados en formato viejo (sin 'visible') se completan sin perder la descripción vacía", () => {
    const merged = mergeAboutContent({
      values: [{ title: "A", description: "" } as never],
    });
    expect(merged.values[0]).toEqual({ title: "A", description: "", visible: true });
  });

  it("el texto editado de una creencia se respeta exactamente (santa cena en minúscula)", () => {
    const merged = mergeAboutContent({
      beliefs: [
        { category: "Santa Cena", content: "Creemos en la santa cena del Señor.", visible: true },
      ],
    });
    expect(merged.beliefs[0].content).toBe("Creemos en la santa cena del Señor.");
    expect(merged.beliefs[0].category).toBe("Santa Cena");
  });

  it("sin valores ni creencias guardados, usa los defaults", () => {
    const merged = mergeAboutContent({});
    expect(merged.values).toEqual(DEFAULT_ABOUT_CONTENT.values);
    expect(merged.beliefs).toEqual(DEFAULT_ABOUT_CONTENT.beliefs);
  });
});
