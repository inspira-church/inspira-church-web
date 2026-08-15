import { describe, expect, it } from "vitest";
import { prayerRequestSchema } from "@/lib/validations/prayer-request";

const valid = {
  name: "María López",
  phone: "3001234567",
  email: "maria@example.com",
  requestText: "Por favor oren por mi familia.",
  isPrivate: false,
  consent: true,
} as const;

describe("prayerRequestSchema", () => {
  it("acepta un envío completo válido", () => {
    expect(prayerRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta sin los campos opcionales", () => {
    const required = { name: valid.name, requestText: valid.requestText, consent: valid.consent };
    expect(prayerRequestSchema.safeParse(required).success).toBe(true);
  });

  it("por defecto isPrivate es false si se omite", () => {
    const rest = { name: valid.name, requestText: valid.requestText, consent: valid.consent };
    const result = prayerRequestSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isPrivate).toBe(false);
  });

  it("rechaza petición vacía", () => {
    const result = prayerRequestSchema.safeParse({ ...valid, requestText: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza consent=false", () => {
    const result = prayerRequestSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
