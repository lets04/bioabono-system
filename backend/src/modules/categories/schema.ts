import { z } from "zod";

export const categoryCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(140),
  descripcion: z.string().trim().max(1000).optional().nullable(),
  activo: z.boolean().optional()
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Debe enviar al menos un campo"
);

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
