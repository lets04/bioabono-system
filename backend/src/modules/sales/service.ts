import * as repository from "./repository.js";
import { saleCreateSchema } from "./schema.js";
import { db } from "../../db/index.js";
import { customers } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function listSales(search?: string) {
  return repository.listSales(search);
}

export async function getSale(id: number) {
  const sale = await repository.getSaleById(id);
  if (!sale) throw new Error("SALE_NOT_FOUND");
  return sale;
}

export async function createSale(body: unknown, usuarioId: number) {
  const input = saleCreateSchema.parse(body);

  if (input.clienteId !== null && input.clienteId !== undefined) {
    const [cliente] = await db.select().from(customers).where(eq(customers.id, input.clienteId)).limit(1);
    if (!cliente) throw new Error("CUSTOMER_NOT_FOUND");
    if (!cliente.activo) throw new Error("CUSTOMER_INACTIVE");
  }

  const result = await repository.createSaleWithTransaction({
    clienteId: input.clienteId ?? null,
    fecha: input.fecha ?? null,
    tipoPrecio: input.tipoPrecio ?? "PVP",
    observacion: input.observacion ?? null,
    detalles: input.detalles.map((d) => ({
      presentacionId: d.presentacionId,
      cantidad: d.cantidad,
      descuentoPorcentaje: String(d.descuentoPorcentaje ?? "0"),
      tipoPrecio: d.tipoPrecio,
    })),
    usuarioId,
  });

  return getSale(result.id);
}
