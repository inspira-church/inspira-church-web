import { describe, expect, it } from "vitest";
import { scheduleSchema } from "@/lib/validations/schedule";

const valid = {
  type: "servicio",
  name: "Servicio dominical",
  dayOfWeek: "0",
  timeOfDay: "10:00",
  location: "Auditorio principal",
  orderIndex: "1",
  active: true,
} as const;

describe("scheduleSchema", () => {
  it("acepta un horario completo válido", () => {
    expect(scheduleSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un tipo fuera del enum", () => {
    expect(scheduleSchema.safeParse({ ...valid, type: "clase" }).success).toBe(false);
  });

  it("rechaza dayOfWeek fuera de 0-6", () => {
    expect(scheduleSchema.safeParse({ ...valid, dayOfWeek: "-1" }).success).toBe(false);
  });

  it("orderIndex por defecto es 0 si se omite", () => {
    const rest = {
      type: valid.type,
      name: valid.name,
      dayOfWeek: valid.dayOfWeek,
      timeOfDay: valid.timeOfDay,
    };
    const result = scheduleSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.orderIndex).toBe(0);
  });

  it("rechaza nombre vacío", () => {
    expect(scheduleSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });
});
