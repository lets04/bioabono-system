import { asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  consignations,
  customers,
  inventoryMovements,
  productPresentations,
  products,
  saleDetails,
  sales,
  auditLogs,
} from "../../db/schema/index.js";
import { adjustStock } from "../../lib/stock.js";
import { derivedPriceCents, fromCents } from "../../lib/pricing.js";

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
      consignacionId: sales.consignacionId,
      consignacionNumero: consignations.numero,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.clienteId, customers.id))
    .leftJoin(consignations, eq(sales.consignacionId, consignations.id))
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
      consignacionId: sales.consignacionId,
      consignacionNumero: consignations.numero,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.clienteId, customers.id))
    .leftJoin(consignations, eq(sales.consignacionId, consignations.id))
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

    // Importes en centavos enteros: el total siempre coincide con la suma de las líneas.
    let subtotalBrutoCents = 0;
    let descuentoTotalCents = 0;
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
          productoActivo: products.activo,
        })
        .from(productPresentations)
        .innerJoin(products, eq(productPresentations.productoId, products.id))
        .where(eq(productPresentations.id, det.presentacionId))
        .limit(1);
      if (!pres) throw new Error(`PRESENTATION_NOT_FOUND:${det.presentacionId}`);
      if (!pres.activo || !pres.productoActivo) throw new Error(`PRESENTATION_INACTIVE:${det.presentacionId}`);
      if (pres.stockActual < det.cantidad) throw new Error(`STOCK_INSUFFICIENT:${det.presentacionId}`);

      const tipo = det.tipoPrecio ?? input.tipoPrecio;
      const precioBaseCents = derivedPriceCents(pres.pvp, tipo);
      const descPct = Number(det.descuentoPorcentaje ?? 0);
      const descuentoCents = Math.round((precioBaseCents * descPct) / 100);
      const subtotalLineaCents = (precioBaseCents - descuentoCents) * det.cantidad;

      subtotalBrutoCents += precioBaseCents * det.cantidad;
      descuentoTotalCents += descuentoCents * det.cantidad;

      enrichedDetalles.push({
        presentacionId: det.presentacionId,
        cantidad: det.cantidad,
        tipoPrecio: tipo,
        precioUnitario: fromCents(precioBaseCents),
        descuentoPorcentaje: descPct.toFixed(2),
        descuentoMonto: fromCents(descuentoCents),
        subtotal: fromCents(subtotalLineaCents),
      });
    }

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
        subtotal: fromCents(subtotalBrutoCents),
        descuentoTotal: fromCents(descuentoTotalCents),
        total: fromCents(subtotalBrutoCents - descuentoTotalCents),
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

      const { stockAnterior, stockPosterior } = await adjustStock(tx, det.presentacionId, -det.cantidad);

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

    await tx.insert(auditLogs).values({
      usuarioId: input.usuarioId,
      accion: "CREAR_VENTA",
      entidad: "venta",
      entidadId: sale.id,
      detalle: { numero: sale.numero },
    });

    return sale;
  });
}
