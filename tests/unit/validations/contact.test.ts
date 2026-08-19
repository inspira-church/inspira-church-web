import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validations/contact";

const noEmail = {
  name: "Juan Pérez",
  phone: "3001234567",
  preferredChannel: "whatsapp",
  reason: "visitar",
  message: "Quisiera visitar la iglesia.",
  consent: true,
} as const;

const valid = { ...noEmail, email: "juan@example.com" } as const;

describe("contactSchema", () => {
  it("acepta un envío completo válido", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta sin el correo (opcional cuando el canal no es 'correo')", () => {
    expect(contactSchema.safeParse(noEmail).success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  " });
    expect(result.success).toBe(false);
  });

  it("rechaza teléfono vacío", () => {
    const result = contactSchema.safeParse({ ...valid, phone: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza correo con formato inválido", () => {
    const result = contactSchema.safeParse({ ...valid, email: "no-es-correo" });
    expect(result.success).toBe(false);
  });

  it("rechaza un motivo fuera del enum", () => {
    const result = contactSchema.safeParse({ ...valid, reason: "otro-motivo-invalido" });
    expect(result.success).toBe(false);
  });

  it("acepta el motivo 'evento'", () => {
    const result = contactSchema.safeParse({ ...valid, reason: "evento" });
    expect(result.success).toBe(true);
  });

  it("rechaza un canal preferido fuera del enum", () => {
    const result = contactSchema.safeParse({ ...valid, preferredChannel: "telepatia" });
    expect(result.success).toBe(false);
  });

  it("rechaza canal 'correo' sin proporcionar email", () => {
    const result = contactSchema.safeParse({ ...noEmail, preferredChannel: "correo" });
    expect(result.success).toBe(false);
  });

  it("acepta canal 'correo' cuando sí hay email", () => {
    const result = contactSchema.safeParse({ ...valid, preferredChannel: "correo" });
    expect(result.success).toBe(true);
  });

  it("rechaza mensaje vacío", () => {
    const result = contactSchema.safeParse({ ...valid, message: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza mensaje de más de 2000 caracteres", () => {
    const result = contactSchema.safeParse({ ...valid, message: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rechaza consent=false", () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
