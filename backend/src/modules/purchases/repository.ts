import { asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  inventoryMovements,
  productPresentations,
  products,
  purchaseDetails,
  purchases,
  suppliers,
  auditLogs,
} from "../../db/schema/index.js";
import { nextDocumentNumber } from "../../lib/documentNumber.js";
import { adjustStock } from "../../lib/stock.js";
import { fromCents, toCents } from "../../lib/pricing.js";

export async function listPurchases(search?: string) {
  const term = search?.trim();

  const rows = await db
    .select({
      id: purchases.id,
      numero: purchases.numero,
      proveedorId: purchases.proveedorId,
      proveedorNombre: suppliers.nombre,
      fecha: purchases.fecha,
      subtotal: purchases.subtotal,
      total: purchases.total,
      estado: purchases.estado,
      observacion: purchases.observacion,
      createdAt: purchases.createdAt,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.proveedorId, suppliers.id))
    .where(
      term
        ? or(ilike(purchases.numero, `%${term}%`), ilike(suppliers.nombre, `%${term}%`))
        : undefined,
    )
    .orderBy(desc(purchases.fecha), desc(purchases.id));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const detailsCount = await db
    .select({ compraId: purchaseDetails.compraId, count: sql<number>`count(*)::int` })
    .from(purchaseDetails)
    .where(inArray(purchaseDetails.compraId, ids))
    .groupBy(purchaseDetails.compraId);

  const countMap = new Map(detailsCount.map((d) => [d.compraId, d.count]));

  return rows.map((r) => ({
    ...r,
    lineas: countMap.get(r.id) ?? 0,
  }));
}

export async function getPurchaseById(id: number) {
  const [purchase] = await db
    .select({
      id: purchases.id,
      numero: purchases.numero,
      proveedorId: purchases.proveedorId,
      proveedorNombre: suppliers.nombre,
      proveedorNit: suppliers.nit,
      proveedorTelefono: suppliers.telefono,
      proveedorEmail: suppliers.email,
      proveedorDireccion: suppliers.direccion,
      fecha: purchases.fecha,
      subtotal: purchases.subtotal,
      descuento: purchases.descuento,
      total: purchases.total,
      estado: purchases.estado,
      observacion: purchases.observacion,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.proveedorId, suppliers.id))
    .where(eq(purchases.id, id))
    .limit(1);

  if (!purchase) return null;

  const detalles = await db
    .select({
      id: purchaseDetails.id,
      presentacionId: purchaseDetails.presentacionId,
      cantidad: purchaseDetails.cantidad,
      precioUnitario: purchaseDetails.precioUnitario,
      subtotal: purchaseDetails.subtotal,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
    })
    .from(purchaseDetails)
    .leftJoin(productPresentations, eq(purchaseDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(eq(purchaseDetails.compraId, id))
    .orderBy(asc(purchaseDetails.id));

  return { ...purchase, detalles };
}

export async function createPurchaseWithTransaction(input: {
  proveedorId: number;
  fecha?: string | null;
  observacion?: string | null;
  detalles: Array<{ presentacionId: number; cantidad: number; precioUnitario: string }>;
  usuarioId: number;
}) {
  return db.transaction(async (tx) => {
    const fecha = input.fecha ? new Date(input.fecha) : new Date();
    if (isNaN(fecha.getTime())) throw new Error("INVALID_DATE");

    // Validar presentaciones y calcular totales
    let subtotalCents = 0;
    for (const det of input.detalles) {
      const precio = Number(det.precioUnitario);
      if (!Number.isFinite(precio) || precio < 0) throw new Error("INVALID_PRICE");
      subtotalCents += det.cantidad * toCents(precio);
    }

    const numero = await nextDocumentNumber(tx, "CMP", purchases, purchases.numero);

    const [purchase] = await tx
      .insert(purchases)
      .values({
        numero,
        proveedorId: input.proveedorId,
        usuarioId: input.usuarioId,
        fecha,
        subtotal: fromCents(subtotalCents),
        descuento: "0",
        total: fromCents(subtotalCents),
        estado: "COMPLETADA",
        observacion: input.observacion?.trim() || null,
      })
      .returning({ id: purchases.id, numero: purchases.numero });

    for (const det of input.detalles) {
      const [presentacion] = await tx
        .select({
          id: productPresentations.id,
          activo: productPresentations.activo,
        })
        .from(productPresentations)
        .where(eq(productPresentations.id, det.presentacionId))
        .limit(1);

      if (!presentacion) throw new Error(`PRESENTATION_NOT_FOUND:${det.presentacionId}`);
      if (!presentacion.activo) throw new Error(`PRESENTATION_INACTIVE:${det.presentacionId}`);

      const precioCents = toCents(det.precioUnitario);

      await tx.insert(purchaseDetails).values({
        compraId: purchase.id,
        presentacionId: det.presentacionId,
        cantidad: det.cantidad,
        precioUnitario: fromCents(precioCents),
        subtotal: fromCents(det.cantidad * precioCents),
      });

      const { stockAnterior, stockPosterior } = await adjustStock(tx, det.presentacionId, det.cantidad);

      await tx.insert(inventoryMovements).values({
        presentacionId: det.presentacionId,
        tipoMovimiento: "COMPRA",
        cantidad: det.cantidad,
        stockAnterior,
        stockPosterior,
        referenciaTipo: "COMPRA",
        referenciaId: purchase.id,
        usuarioId: input.usuarioId,
        observacion: null,
      });
    }

    await tx.insert(auditLogs).values({
      usuarioId: input.usuarioId,
      accion: "CREAR_COMPRA",
      entidad: "compra",
      entidadId: purchase.id,
      detalle: { numero: purchase.numero },
    });

    return purchase;
  });
}
