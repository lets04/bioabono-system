import { z } from "zod";
import { numericString } from "../../lib/validation.js";

export const purchaseCreateSchema = z.object({
  proveedorId: z.number().int().positive("El proveedor es obligatorio"),
  fecha: z.string().trim().optional().nullable(),
  observacion: z.string().trim().max(2000).optional().nullable(),
  detalles: z
    .array(
      z.object({
        presentacionId: z.number().int().positive("La presentación es obligatoria"),
        cantidad: z.number().int().positive("La cantidad debe ser mayor que cero"),
        precioUnitario: numericString.refine((v) => Number(v) >= 0, "El precio no puede ser negativo"),
      }),
    )
    .min(1, "Debe incluir al menos un producto"),
});

export type PurchaseCreateInput = z.infer<typeof purchaseCreateSchema>;
