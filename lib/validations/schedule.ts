import { z } from "zod";

export const scheduleSchema = z
  .object({
    type: z.enum(["servicio", "reunion", "grupo", "actividad"], {
      message: "Selecciona un tipo.",
    }),
    name: z.string().trim().min(1, "Ingresa el nombre."),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    timeOfDay: z.string().trim().min(1, "Ingresa la hora."),
    location: z.string().trim().optional(),
    orderIndex: z.coerce.number().int().default(0),
    active: z.boolean().default(true),
    recurrence: z.enum(["weekly", "monthly"]).default("weekly"),
    monthlyWeek: z.coerce.number().int().refine((v) => [1, 2, 3, 4, -1].includes(v)).nullable().optional(),
  })
  .refine((data) => data.recurrence !== "monthly" || data.monthlyWeek != null, {
    message: "Selecciona qué semana del mes.",
    path: ["monthlyWeek"],
  })
  .transform((data) => ({
    ...data,
    monthlyWeek: data.recurrence === "monthly" ? data.monthlyWeek! : null,
  }));

export type ScheduleInput = z.infer<typeof scheduleSchema>;
