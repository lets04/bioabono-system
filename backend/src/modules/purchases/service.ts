import * as repository from "./repository.js";
import { purchaseCreateSchema } from "./schema.js";
import { db } from "../../db/index.js";
import { suppliers } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function listPurchases(search?: string) {
  return repository.listPurchases(search);
}

export async function getPurchase(id: number) {
  const purchase = await repository.getPurchaseById(id);
  if (!purchase) throw new Error("PURCHASE_NOT_FOUND");
  return purchase;
}

export async function createPurchase(body: unknown) {
  const input = purchaseCreateSchema.parse(body);

  // Validar proveedor existe y activo
  const [proveedor] = await db.select().from(suppliers).where(eq(suppliers.id, input.proveedorId)).limit(1);
  if (!proveedor) throw new Error("SUPPLIER_NOT_FOUND");
  if (!proveedor.activo) throw new Error("SUPPLIER_INACTIVE");

  const usuarioId = await repository.getSystemUserId();

  const result = await repository.createPurchaseWithTransaction({
    proveedorId: input.proveedorId,
    fecha: input.fecha ?? null,
    observacion: input.observacion ?? null,
    detalles: input.detalles.map((d) => ({
      presentacionId: d.presentacionId,
      cantidad: d.cantidad,
      precioUnitario: String(d.precioUnitario),
    })),
    usuarioId,
  });

  return getPurchase(result.id);
}
