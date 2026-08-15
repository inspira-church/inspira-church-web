import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Una Vida con Propósito")).toBe("una-vida-con-proposito");
  });

  it("quita acentos", () => {
    expect(slugify("Reunión de líderes")).toBe("reunion-de-lideres");
  });

  it("quita caracteres que no son letras, números ni espacios", () => {
    expect(slugify("¡Ven y Únete! (2026)")).toBe("ven-y-unete-2026");
  });

  it("colapsa espacios y guiones repetidos", () => {
    expect(slugify("Grupo   de   Jóvenes")).toBe("grupo-de-jovenes");
  });

  it("quita guiones al inicio y al final", () => {
    expect(slugify("  -Evento Especial-  ")).toBe("evento-especial");
  });
});
