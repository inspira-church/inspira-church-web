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

  it("recurrence por defecto es 'weekly' y monthlyWeek queda null", () => {
    const result = scheduleSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.recurrence).toBe("weekly");
      expect(result.data.monthlyWeek).toBeNull();
    }
  });

  it("acepta recurrence 'monthly' con monthlyWeek válido (-1 = última semana)", () => {
    const result = scheduleSchema.safeParse({
      ...valid,
      recurrence: "monthly",
      monthlyWeek: "-1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.monthlyWeek).toBe(-1);
  });

  it("rechaza recurrence 'monthly' sin monthlyWeek", () => {
    expect(
      scheduleSchema.safeParse({ ...valid, recurrence: "monthly" }).success
    ).toBe(false);
  });

  it("rechaza monthlyWeek fuera de {1,2,3,4,-1}", () => {
    expect(
      scheduleSchema.safeParse({ ...valid, recurrence: "monthly", monthlyWeek: "5" }).success
    ).toBe(false);
  });

  it("ignora monthlyWeek si recurrence es 'weekly' (fuerza null)", () => {
    const result = scheduleSchema.safeParse({
      ...valid,
      recurrence: "weekly",
      monthlyWeek: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.monthlyWeek).toBeNull();
  });
});
