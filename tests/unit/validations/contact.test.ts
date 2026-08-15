import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validations/contact";

const valid = {
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "3001234567",
  whatsapp: "3001234567",
  reason: "visitar",
  message: "Quisiera visitar la iglesia.",
  consent: true,
} as const;

describe("contactSchema", () => {
  it("acepta un envío completo válido", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta sin los campos opcionales", () => {
    const required = { name: valid.name, reason: valid.reason, consent: valid.consent };
    expect(contactSchema.safeParse(required).success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  " });
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

  it("rechaza mensaje de más de 2000 caracteres", () => {
    const result = contactSchema.safeParse({ ...valid, message: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rechaza consent=false", () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
