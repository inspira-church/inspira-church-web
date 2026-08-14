import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().min(1, "Ingresa tu correo.").email("Correo inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().min(1, "Ingresa tu correo.").email("Correo inválido."),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
