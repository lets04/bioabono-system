import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  customers,
  inventoryMovements,
  productPresentations,
  products,
  saleDetails,
  sales,
} from "../../db/schema/index.js";

function derivedPrice(pvp: number, tipoPrecio: string): number {
  switch (tipoPrecio) {
    case "CONSIGNACION":
      return pvp * 0.8;
    case "CONTADO":
      return pvp * 0.75;
    case "MAYORISTA":
      return pvp * 0.7;
    case "PVP":
    default:
      return pvp;
  }
}

export async function listSales(search?: string) {
  const term = search?.trim();
  const rows = await db
    .select({
      id: sales.id,
      numero: sales.numero,
      clienteId: sales.clienteId,
      clienteNombre: customers.nombre,
      fecha: sales.fecha,
      subtotal: sales.subtotal,
      descuentoTotal: sales.descuentoTotal,
      total: sales.total,
      estado: sales.estado,
      observacion: sales.observacion,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.clienteId, customers.id))
    .where(
      term
        ? or(
            ilike(sales.numero, `%${term}%`),
            ilike(customers.nombre, `%${term}%`),
            sql`${sales.id}::text ILIKE ${`%${term}%`}`,
          )
        : undefined,
    )
    .orderBy(desc(sales.fecha), desc(sales.id));

  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const counts = await db
    .select({ ventaId: saleDetails.ventaId, count: sql<number>`count(*)::int` })
    .from(saleDetails)
    .where(sql`${saleDetails.ventaId} IN (${sql.join(ids.map((id) => sql`${id}`), sql`,`)})`)
    .groupBy(saleDetails.ventaId);
  const map = new Map(counts.map((c) => [c.ventaId, c.count]));
  return rows.map((r) => ({ ...r, lineas: map.get(r.id) ?? 0 }));
}

export async function getSaleById(id: number) {
  const [sale] = await db
    .select({
      id: sales.id,
      numero: sales.numero,
      clienteId: sales.clienteId,
      clienteNombre: customers.nombre,
      clienteNitCi: customers.nitCi,
      clienteTelefono: customers.telefono,
      clienteEmail: customers.email,
      clienteDireccion: customers.direccion,
      fecha: sales.fecha,
      subtotal: sales.subtotal,
      descuentoTotal: sales.descuentoTotal,
      total: sales.total,
      estado: sales.estado,
      observacion: sales.observacion,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.clienteId, customers.id))
    .where(eq(sales.id, id))
    .limit(1);
  if (!sale) return null;

  const detalles = await db
    .select({
      id: saleDetails.id,
      presentacionId: saleDetails.presentacionId,
      cantidad: saleDetails.cantidad,
      tipoPrecio: saleDetails.tipoPrecio,
      precioUnitario: saleDetails.precioUnitario,
      descuentoPorcentaje: saleDetails.descuentoPorcentaje,
      descuentoMonto: saleDetails.descuentoMonto,
      subtotal: saleDetails.subtotal,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
    })
    .from(saleDetails)
    .leftJoin(productPresentations, eq(saleDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(eq(saleDetails.ventaId, id))
    .orderBy(asc(saleDetails.id));

  return { ...sale, detalles };
}

export async function createSaleWithTransaction(input: {
  clienteId: number | null;
  fecha?: string | null;
  tipoPrecio: string;
  observacion?: string | null;
  detalles: Array<{ presentacionId: number; cantidad: number; descuentoPorcentaje: string; tipoPrecio?: string }>;
  usuarioId: number;
}) {
  return db.transaction(async (tx) => {
    const fecha = input.fecha ? new Date(input.fecha) : new Date();
    if (isNaN(fecha.getTime())) throw new Error("INVALID_DATE");

    let subtotalBruto = 0;
    let descuentoTotal = 0;
    const enrichedDetalles: Array<{
      presentacionId: number;
      cantidad: number;
      tipoPrecio: string;
      precioUnitario: string;
      descuentoPorcentaje: string;
      descuentoMonto: string;
      subtotal: string;
    }> = [];

    for (const det of input.detalles) {
      const [pres] = await tx
        .select({
          id: productPresentations.id,
          pvp: productPresentations.pvp,
          stockActual: productPresentations.stockActual,
          activo: productPresentations.activo,
        })
        .from(productPresentations)
        .where(eq(productPresentations.id, det.presentacionId))
        .limit(1);
      if (!pres) throw new Error(`PRESENTATION_NOT_FOUND:${det.presentacionId}`);
      if (!pres.activo) throw new Error(`PRESENTATION_INACTIVE:${det.presentacionId}`);
      if (pres.stockActual < det.cantidad) throw new Error(`STOCK_INSUFFICIENT:${det.presentacionId}`);

      const tipo = det.tipoPrecio ?? input.tipoPrecio;
      const pvpNum = Number(pres.pvp);
      const precioBase = derivedPrice(pvpNum, tipo);
      const descPct = Number(det.descuentoPorcentaje ?? 0);
      const descuentoMonto = precioBase * (descPct / 100);
      const precioFinal = precioBase - descuentoMonto;
      const subtotalLinea = precioFinal * det.cantidad;

      subtotalBruto += precioBase * det.cantidad;
      descuentoTotal += descuentoMonto * det.cantidad;

      enrichedDetalles.push({
        presentacionId: det.presentacionId,
        cantidad: det.cantidad,
        tipoPrecio: tipo,
        precioUnitario: precioBase.toFixed(2),
        descuentoPorcentaje: descPct.toFixed(2),
        descuentoMonto: descuentoMonto.toFixed(2),
        subtotal: subtotalLinea.toFixed(2),
      });
    }

    const total = subtotalBruto - descuentoTotal;
    const numero = `VTA-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const [sale] = await tx
      .insert(sales)
      .values({
        numero,
        clienteId: input.clienteId,
        usuarioId: input.usuarioId,
        fecha,
        subtotal: subtotalBruto.toFixed(2),
        descuentoTotal: descuentoTotal.toFixed(2),
        total: total.toFixed(2),
        estado: "COMPLETADA",
        observacion: input.observacion?.trim() || null,
      })
      .returning({ id: sales.id, numero: sales.numero });

    for (const det of enrichedDetalles) {
      await tx.insert(saleDetails).values({
        ventaId: sale.id,
        presentacionId: det.presentacionId,
        cantidad: det.cantidad,
        tipoPrecio: det.tipoPrecio as any,
        precioUnitario: det.precioUnitario,
        descuentoPorcentaje: det.descuentoPorcentaje,
        descuentoMonto: det.descuentoMonto,
        subtotal: det.subtotal,
      });

      const [pres] = await tx
        .select({ stockActual: productPresentations.stockActual })
        .from(productPresentations)
        .where(eq(productPresentations.id, det.presentacionId))
        .limit(1);
      const stockAnterior = pres.stockActual;
      const stockPosterior = stockAnterior - det.cantidad;

      await tx
        .update(productPresentations)
        .set({ stockActual: stockPosterior, updatedAt: new Date() })
        .where(eq(productPresentations.id, det.presentacionId));

      await tx.insert(inventoryMovements).values({
        presentacionId: det.presentacionId,
        tipoMovimiento: "VENTA",
        cantidad: det.cantidad,
        stockAnterior,
        stockPosterior,
        referenciaTipo: "VENTA",
        referenciaId: sale.id,
        usuarioId: input.usuarioId,
        observacion: null,
      });
    }

    return sale;
  });
}

export async function getSystemUserId(): Promise<number> {
  const result = await db.execute(sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`);
  const row = (result.rows as any[])[0];
  if (!row) throw new Error("NO_SYSTEM_USER");
  return Number(row.id);
}
