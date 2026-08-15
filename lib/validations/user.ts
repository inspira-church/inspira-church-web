import { z } from "zod";

export const inviteUserSchema = z.object({
  fullName: z.string().trim().min(1, "Ingresa el nombre completo."),
  email: z.string().trim().email("Ingresa un correo válido."),
  phone: z.string().trim().optional(),
  role: z.enum(["admin", "editor"], { message: "Selecciona un rol." }),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1, "Ingresa el nombre completo."),
  phone: z.string().trim().optional(),
  role: z.enum(["admin", "editor"], { message: "Selecciona un rol." }),
  active: z.boolean().default(true),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
