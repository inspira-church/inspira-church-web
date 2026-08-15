import { describe, expect, it } from "vitest";
import { teamMemberSchema } from "@/lib/validations/team-member";

const valid = {
  fullName: "Pastor Andrés Gómez",
  type: "pastor",
  roleTitle: "Pastor Principal",
  bio: "Sirviendo a la comunidad desde 2010.",
  photoUrl: "https://example.com/foto.jpg",
  orderIndex: "1",
  active: true,
} as const;

describe("teamMemberSchema", () => {
  it("acepta un miembro completo válido", () => {
    expect(teamMemberSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un tipo fuera del enum", () => {
    expect(teamMemberSchema.safeParse({ ...valid, type: "diacono" }).success).toBe(false);
  });

  it("rechaza cargo vacío", () => {
    expect(teamMemberSchema.safeParse({ ...valid, roleTitle: "" }).success).toBe(false);
  });

  it("orderIndex por defecto es 0 si se omite", () => {
    const rest = { fullName: valid.fullName, type: valid.type, roleTitle: valid.roleTitle };
    const result = teamMemberSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.orderIndex).toBe(0);
  });

  it("rechaza biografía de más de 1000 caracteres", () => {
    expect(teamMemberSchema.safeParse({ ...valid, bio: "a".repeat(1001) }).success).toBe(false);
  });
});
