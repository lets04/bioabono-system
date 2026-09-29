import { z } from "zod";

const numericString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .refine((v) => v !== "" && Number.isFinite(Number(v)), "Debe ser un número válido");

export const saleCreateSchema = z.object({
  clienteId: z.number().int().positive().optional().nullable(),
  fecha: z.string().trim().optional().nullable(),
  tipoPrecio: z.enum(["PVP", "CONTADO", "MAYORISTA"]).optional().default("PVP"),
  observacion: z.string().trim().max(2000).optional().nullable(),
  detalles: z
    .array(
      z.object({
        presentacionId: z.number().int().positive("La presentación es obligatoria"),
        cantidad: z.number().int().positive("La cantidad debe ser mayor que cero"),
        descuentoPorcentaje: numericString
          .refine((v) => Number(v) >= 0 && Number(v) <= 100, "Descuento debe ser entre 0 y 100")
          .optional()
          .default("0"),
        tipoPrecio: z.enum(["PVP", "CONTADO", "MAYORISTA"]).optional(),
      }),
    )
    .min(1, "Debe incluir al menos un producto"),
});

export type SaleCreateInput = z.infer<typeof saleCreateSchema>;
