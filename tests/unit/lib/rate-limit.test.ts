import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("permite las primeras 5 solicitudes de un identificador nuevo", () => {
    const id = `test-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(id)).toBe(true);
    }
  });

  it("bloquea la sexta solicitud dentro de la ventana", () => {
    const id = `test-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(id);
    expect(checkRateLimit(id)).toBe(false);
  });

  it("cuenta cada identificador por separado", () => {
    const idA = `test-a-${crypto.randomUUID()}`;
    const idB = `test-b-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) checkRateLimit(idA);
    expect(checkRateLimit(idA)).toBe(false);
    expect(checkRateLimit(idB)).toBe(true);
  });
});
