import { describe, expect, it } from "vitest";
import { groupJoinSchema } from "@/lib/validations/group-join";

const valid = {
  firstName: "Carlos",
  lastName: "Ramírez",
  phone: "3001234567",
  whatsapp: "3001234567",
  email: "carlos@example.com",
  age: "28",
  city: "Bogotá",
  locality: "Chapinero",
  neighborhood: "El Retiro",
  groupId: "11111111-1111-1111-1111-111111111111",
  availability: "Entre semana en la noche",
  notes: "Ninguna",
  consent: true,
} as const;

describe("groupJoinSchema", () => {
  it("acepta un envío completo válido", () => {
    expect(groupJoinSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta sin los campos opcionales", () => {
    const required = {
      firstName: valid.firstName,
      lastName: valid.lastName,
      phone: valid.phone,
      city: valid.city,
      consent: valid.consent,
    };
    expect(groupJoinSchema.safeParse(required).success).toBe(true);
  });

  it("convierte age de string a number", () => {
    const result = groupJoinSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.age).toBe(28);
  });

  it("rechaza edad negativa", () => {
    const result = groupJoinSchema.safeParse({ ...valid, age: "-5" });
    expect(result.success).toBe(false);
  });

  it("rechaza teléfono vacío", () => {
    const result = groupJoinSchema.safeParse({ ...valid, phone: "" });
    expect(result.success).toBe(false);
  });

  it("rechaza notas de más de 1000 caracteres", () => {
    const result = groupJoinSchema.safeParse({ ...valid, notes: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("rechaza consent=false", () => {
    const result = groupJoinSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });
});
