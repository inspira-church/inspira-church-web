import { describe, expect, it } from "vitest";
import { firstFieldErrors } from "@/lib/form-errors";

describe("firstFieldErrors", () => {
  it("mapea cada issue a su campo", () => {
    const result = firstFieldErrors([
      { path: ["email"], message: "Correo inválido." },
      { path: ["name"], message: "Ingresa tu nombre." },
    ]);
    expect(result).toEqual({
      email: "Correo inválido.",
      name: "Ingresa tu nombre.",
    });
  });

  it("conserva solo el primer mensaje por campo", () => {
    const result = firstFieldErrors([
      { path: ["password"], message: "Muy corta." },
      { path: ["password"], message: "Debe tener un número." },
    ]);
    expect(result).toEqual({ password: "Muy corta." });
  });

  it("usa 'form' cuando el issue no tiene path", () => {
    const result = firstFieldErrors([{ path: [], message: "Las contraseñas no coinciden." }]);
    expect(result).toEqual({ form: "Las contraseñas no coinciden." });
  });
});
