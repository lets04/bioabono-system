import { z } from "zod";

export const customerCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(180),
  nitCi: z.string().trim().max(60).optional().nullable(),
  telefono: z.string().trim().max(60).optional().nullable(),
  email: z.string().trim().email("Email no válido").max(160).optional().nullable().or(z.literal("")),
  direccion: z.string().trim().max(2000).optional().nullable(),
  activo: z.boolean().optional(),
});

export const customerUpdateSchema = customerCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Debe enviar al menos un campo",
);

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
