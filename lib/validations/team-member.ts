import { z } from "zod";

export const teamMemberSchema = z.object({
  fullName: z.string().trim().min(1, "Ingresa el nombre completo."),
  type: z.enum(["pastor", "lider"], { message: "Selecciona un tipo." }),
  roleTitle: z.string().trim().min(1, "Ingresa el cargo."),
  bio: z.string().trim().max(1000, "Máximo 1000 caracteres.").optional(),
  photoUrl: z.string().trim().optional(),
  orderIndex: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
