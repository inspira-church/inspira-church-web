import { describe, expect, it } from "vitest";
import {
  requestPasswordResetSchema,
  signInSchema,
  updatePasswordSchema,
} from "@/lib/validations/auth";

describe("signInSchema", () => {
  it("acepta correo y contraseña válidos", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "secreta123" }).success).toBe(
      true
    );
  });

  it("rechaza correo vacío", () => {
    expect(signInSchema.safeParse({ email: "", password: "secreta123" }).success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("acepta un correo válido", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "no-es-correo" }).success).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("acepta cuando ambas contraseñas coinciden y tienen 8+ caracteres", () => {
    const result = updatePasswordSchema.safeParse({
      password: "supersegura",
      confirmPassword: "supersegura",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza contraseñas de menos de 8 caracteres", () => {
    const result = updatePasswordSchema.safeParse({
      password: "corta1",
      confirmPassword: "corta1",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    const result = updatePasswordSchema.safeParse({
      password: "supersegura",
      confirmPassword: "otradistinta",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });
});
