import { z } from "zod";
import { numericString } from "../../lib/validation.js";

const presentacionCreateSchema = z.object({
  cantidad: numericString.refine((value) => Number(value) > 0, "La cantidad debe ser mayor que cero"),
  unidadMedida: z.string().trim().min(1, "La unidad es obligatoria").max(30),
  pvp: numericString.refine((value) => Number(value) >= 0, "El PVP no puede ser negativo"),
  stockMinimo: z.number().int().min(0).optional().default(0),
  activo: z.boolean().optional().default(true),
});

const presentacionUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  cantidad: numericString.refine((value) => Number(value) > 0, "La cantidad debe ser mayor que cero"),
  unidadMedida: z.string().trim().min(1, "La unidad es obligatoria").max(30),
  pvp: numericString.refine((value) => Number(value) >= 0, "El PVP no puede ser negativo"),
  stockMinimo: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

export const productCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(180),
  abreviacion: z
    .string()
    .trim()
    .min(2, "La abreviación debe tener al menos 2 caracteres")
    .max(10)
    .regex(/^[A-Za-z]{2,10}$/, "La abreviación debe contener solo letras (2-10)"),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  categoriaId: z.number().int().positive().optional().nullable(),
  activo: z.boolean().optional().default(true),
  presentaciones: z
    .array(presentacionCreateSchema)
    .min(1, "Debe incluir al menos una presentación")
    .max(20, "Máximo 20 presentaciones por producto"),
});

export const productUpdateSchema = z.object({
  nombre: z.string().trim().min(1).max(180).optional(),
  abreviacion: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[A-Za-z]{2,10}$/, "La abreviación debe contener solo letras (2-10)")
    .optional(),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  categoriaId: z.number().int().positive().optional().nullable(),
  activo: z.boolean().optional(),
  presentaciones: z.array(presentacionUpdateSchema).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type PresentacionCreateInput = z.infer<typeof presentacionCreateSchema>;
export type PresentacionUpdateInput = z.infer<typeof presentacionUpdateSchema>;
