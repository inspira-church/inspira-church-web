import { describe, expect, it } from "vitest";
import { getVisibleValues } from "@/lib/about-values";

describe("getVisibleValues", () => {
  it("valor visible con descripción: se muestra (título y descripción)", () => {
    const result = getVisibleValues([{ title: "SANTIDAD", description: "Texto.", visible: true }]);
    expect(result).toEqual([{ title: "SANTIDAD", description: "Texto.", visible: true }]);
  });

  it("valor visible con descripción vacía: SÍ se muestra (la descripción es opcional)", () => {
    const result = getVisibleValues([{ title: "SANTIDAD", description: "", visible: true }]);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("SANTIDAD");
  });

  it("descripción solo con espacios cuenta como vacía y tampoco oculta el valor", () => {
    expect(getVisibleValues([{ title: "PASIÓN", description: "   ", visible: true }])).toHaveLength(1);
  });

  it("visible=false: no se muestra, tenga o no descripción", () => {
    const result = getVisibleValues([
      { title: "A", description: "con texto", visible: false },
      { title: "B", description: "", visible: false },
    ]);
    expect(result).toEqual([]);
  });

  it("sin título no hay nada que mostrar", () => {
    expect(getVisibleValues([{ title: "  ", description: "texto", visible: true }])).toEqual([]);
  });

  it("conserva el orden del CMS", () => {
    const result = getVisibleValues([
      { title: "UNO", description: "", visible: true },
      { title: "OCULTO", description: "x", visible: false },
      { title: "DOS", description: "y", visible: true },
    ]);
    expect(result.map((v) => v.title)).toEqual(["UNO", "DOS"]);
  });
});
