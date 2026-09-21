import { z } from "zod";

export const reportFiltersSchema = z.object({
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  proveedorId: z.coerce.number().int().positive().optional().nullable(),
  clienteId: z.coerce.number().int().positive().optional().nullable(),
  tipoPrecio: z.enum(["PVP", "CONSIGNACION", "CONTADO", "MAYORISTA"]).optional().nullable(),
  categoriaId: z.coerce.number().int().positive().optional().nullable(),
  estado: z.enum(["bajo", "sin", "normal", "activo", "inactivo", "todos"]).optional().nullable(),
});

export type ReportFilters = z.infer<typeof reportFiltersSchema>;
