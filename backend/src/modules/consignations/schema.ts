import { z } from "zod";

const numericString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => v !== "" && Number.isFinite(Number(v)), "Debe ser un número válido");

export const consignationCreateSchema = z.object({
  clienteId: z.number().int().positive("El cliente es obligatorio"),
  fechaEntrega: z.string().trim().optional().nullable(),
  observacion: z.string().trim().max(2000).optional().nullable(),
  detalles: z
    .array(
      z.object({
        presentacionId: z.number().int().positive("La presentación es obligatoria"),
        cantidadEntregada: z.number().int().positive("La cantidad entregada debe ser mayor que cero"),
      }),
    )
    .min(1, "Debe incluir al menos un producto"),
});

export const consignationLiquidateSchema = z.object({
  detalles: z
    .array(
      z.object({
        presentacionId: z.number().int().positive("La presentación es obligatoria"),
        cantidadVendida: z.number().int().nonnegative("La cantidad vendida no puede ser negativa"),
        cantidadDevuelta: z.number().int().nonnegative("La cantidad devuelta no puede ser negativa"),
      }),
    )
    .min(1, "Debe incluir al menos un producto"),
});

export const consignationListSchema = z.object({
  search: z.string().trim().optional(),
  estado: z.enum(["PENDIENTE", "LIQUIDADA", "todos"]).optional(),
});

export type ConsignationCreateInput = z.infer<typeof consignationCreateSchema>;
export type ConsignationLiquidateInput = z.infer<typeof consignationLiquidateSchema>;
export type ConsignationListFilters = z.infer<typeof consignationListSchema>;

export const numericStringSchema = numericString;