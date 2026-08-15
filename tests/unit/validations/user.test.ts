import { describe, expect, it } from "vitest";
import { inviteUserSchema, updateUserSchema } from "@/lib/validations/user";

describe("inviteUserSchema", () => {
  const valid = {
    fullName: "Laura Martínez",
    email: "laura@example.com",
    phone: "3001234567",
    role: "editor",
  } as const;

  it("acepta una invitación completa válida", () => {
    expect(inviteUserSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta sin teléfono (opcional)", () => {
    const rest = { fullName: valid.fullName, email: valid.email, role: valid.role };
    expect(inviteUserSchema.safeParse(rest).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(inviteUserSchema.safeParse({ ...valid, email: "no-es-correo" }).success).toBe(false);
  });

  it("rechaza un rol fuera del enum", () => {
    expect(inviteUserSchema.safeParse({ ...valid, role: "superadmin" }).success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    expect(inviteUserSchema.safeParse({ ...valid, fullName: "   " }).success).toBe(false);
  });
});

describe("updateUserSchema", () => {
  const valid = {
    fullName: "Laura Martínez",
    phone: "3001234567",
    role: "admin",
    active: true,
  } as const;

  it("acepta una actualización completa válida", () => {
    expect(updateUserSchema.safeParse(valid).success).toBe(true);
  });

  it("active por defecto es true si se omite", () => {
    const rest = { fullName: valid.fullName, phone: valid.phone, role: valid.role };
    const result = updateUserSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.active).toBe(true);
  });

  it("rechaza un rol fuera del enum", () => {
    expect(updateUserSchema.safeParse({ ...valid, role: "editorial" }).success).toBe(false);
  });
});
