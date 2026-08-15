import { describe, expect, it } from "vitest";
import { growthGroupSchema } from "@/lib/validations/growth-group";

const valid = {
  name: "Grupo Renuevo",
  slug: "grupo-renuevo",
  groupType: "familiar",
  description: "Grupo para familias jóvenes.",
  city: "Bogotá",
  locality: "Suba",
  sector: "Niza",
  latApprox: "4.71",
  lngApprox: "-74.07",
  dayOfWeek: "3",
  timeOfDay: "19:00",
  leaderId: "11111111-1111-1111-1111-111111111111",
  exactAddress: "Calle 123 # 45-67",
  leaderPhonePrivate: "3001234567",
  active: true,
} as const;

describe("growthGroupSchema", () => {
  it("acepta un grupo completo válido", () => {
    expect(growthGroupSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un slug inválido", () => {
    expect(growthGroupSchema.safeParse({ ...valid, slug: "Grupo Renuevo!" }).success).toBe(false);
  });

  it("rechaza dayOfWeek fuera de 0-6", () => {
    expect(growthGroupSchema.safeParse({ ...valid, dayOfWeek: "7" }).success).toBe(false);
  });

  it("rechaza ciudad vacía", () => {
    expect(growthGroupSchema.safeParse({ ...valid, city: "" }).success).toBe(false);
  });

  it("por defecto active es true si se omite", () => {
    const rest = {
      name: valid.name,
      slug: valid.slug,
      groupType: valid.groupType,
      city: valid.city,
      dayOfWeek: valid.dayOfWeek,
      timeOfDay: valid.timeOfDay,
    };
    const result = growthGroupSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.active).toBe(true);
  });
});
