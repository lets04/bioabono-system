import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  auditLogs,
  consignmentDetails,
  consignations,
  customers,
  inventoryMovements,
  productPresentations,
  products,
  saleDetails,
  sales,
  users,
} from "../../db/schema/index.js";
import { adjustStock } from "../../lib/stock.js";
import { derivedPriceCents, fromCents, toCents } from "../../lib/pricing.js";
import type { ConsignationCreateInput, ConsignationLiquidateInput, ConsignationListFilters } from "./schema.js";

export async function listConsignations(filters: ConsignationListFilters) {
  const term = filters.search?.trim();
  const estado = filters.estado && filters.estado !== "todos" ? filters.estado : undefined;

  const conditions = [];
  if (estado) conditions.push(eq(consignations.estado, estado as any));
  if (term) conditions.push(or(ilike(consignations.numero, `%${term}%`), ilike(customers.nombre, `%${term}%`)));

  const rows = await db
    .select({
      id: consignations.id,
      numero: consignations.numero,
      clienteId: consignations.clienteId,
      clienteNombre: customers.nombre,
      fechaEntrega: consignations.fechaEntrega,
      estado: consignations.estado,
      observacion: consignations.observacion,
      createdAt: consignations.createdAt,
    })
    .from(consignations)
    .leftJoin(customers, eq(consignations.clienteId, customers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(consignations.fechaEntrega), desc(consignations.id));

  if (rows.length === 0) return rows;

  const ids = rows.map((r) => r.id);
  const counts = await db
    .select({ consignacionId: consignmentDetails.consignacionId, count: sql<number>`count(*)::int` })
    .from(consignmentDetails)
    .where(sql`${consignmentDetails.consignacionId} IN (${sql.join(ids.map((id) => sql`${id}`), sql`,`)})`)
    .groupBy(consignmentDetails.consignacionId);
  const map = new Map(counts.map((c) => [c.consignacionId, c.count]));

  return rows.map((r) => ({ ...r, lineas: map.get(r.id) ?? 0 }));
}

export async function getConsignationById(id: number) {
  const [consignation] = await db
    .select({
      id: consignations.id,
      numero: consignations.numero,
      clienteId: consignations.clienteId,
      clienteNombre: customers.nombre,
      clienteNitCi: customers.nitCi,
      clienteTelefono: customers.telefono,
      clienteEmail: customers.email,
      clienteDireccion: customers.direccion,
      fechaEntrega: consignations.fechaEntrega,
      estado: consignations.estado,
      observacion: consignations.observacion,
      createdAt: consignations.createdAt,
      updatedAt: consignations.updatedAt,
      usuarioNombre: users.nombre,
    })
    .from(consignations)
    .leftJoin(customers, eq(consignations.clienteId, customers.id))
    .leftJoin(users, eq(consignations.usuarioId, users.id))
    .where(eq(consignations.id, id))
    .limit(1);
  if (!consignation) return null;

  const detalles = await db
    .select({
      id: consignmentDetails.id,
      presentacionId: consignmentDetails.presentacionId,
      cantidadEntregada: consignmentDetails.cantidadEntregada,
      cantidadVendida: consignmentDetails.cantidadVendida,
      cantidadDevuelta: consignmentDetails.cantidadDevuelta,
      precioConsignacion: consignmentDetails.precioConsignacion,
      importeVendido: consignmentDetails.importeVendido,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
    })
    .from(consignmentDetails)
    .leftJoin(productPresentations, eq(consignmentDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(eq(consignmentDetails.consignacionId, id))
    .orderBy(asc(consignmentDetails.id));

  const venta = await db
    .select({
      id: sales.id,
      numero: sales.numero,
      total: sales.total,
      fecha: sales.fecha,
    })
    .from(sales)
    .where(eq(sales.consignacionId, id))
    .limit(1);

  return {
    ...consignation,
    detalles,
    venta: venta[0] ?? null,
  };
}

export async function createConsignationWithTransaction(input: ConsignationCreateInput, usuarioId: number) {
  return db.transaction(async (tx) => {
    const fechaEntrega = input.fechaEntrega ? new Date(input.fechaEntrega) : new Date();
    if (isNaN(fechaEntrega.getTime())) throw new Error("INVALID_DATE");

    const now = new Date();
    const numero = `CSG-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const [consignation] = await tx
      .insert(consignations)
      .values({
        numero,
        clienteId: input.clienteId,
        usuarioId,
        fechaEntrega,
        estado: "PENDIENTE",
        observacion: input.observacion?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: consignations.id, numero: consignations.numero });

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
      if (pres.stockActual < det.cantidadEntregada)
        throw new Error(`STOCK_INSUFFICIENT:${det.presentacionId}`);

      const precioConsignacion = fromCents(derivedPriceCents(pres.pvp, "CONSIGNACION"));

      await tx.insert(consignmentDetails).values({
        consignacionId: consignation.id,
        presentacionId: det.presentacionId,
        cantidadEntregada: det.cantidadEntregada,
        cantidadVendida: 0,
        cantidadDevuelta: 0,
        precioConsignacion,
        importeVendido: "0",
      });

      const { stockAnterior, stockPosterior } = await adjustStock(
        tx,
        det.presentacionId,
        -det.cantidadEntregada,
        now,
      );

      await tx.insert(inventoryMovements).values({
        presentacionId: det.presentacionId,
        tipoMovimiento: "SALIDA_A_CONSIGNACION",
        cantidad: det.cantidadEntregada,
        stockAnterior,
        stockPosterior,
        referenciaTipo: "CONSIGNACION",
        referenciaId: consignation.id,
        usuarioId,
        fecha: now,
        observacion: `Entrega de consignación ${numero}`,
      });
    }

    await tx.insert(auditLogs).values({
      usuarioId,
      accion: "CREAR_CONSIGNACION",
      entidad: "consignacion",
      entidadId: consignation.id,
      fecha: now,
      detalle: { numero },
    });

    return consignation;
  });
}

export async function liquidateConsignationWithTransaction(
  id: number,
  input: ConsignationLiquidateInput,
  usuarioId: number,
) {
  return db.transaction(async (tx) => {
    const [consignation] = await tx
      .select({
        id: consignations.id,
        numero: consignations.numero,
        clienteId: consignations.clienteId,
        estado: consignations.estado,
      })
      .from(consignations)
      .where(eq(consignations.id, id))
      .limit(1)
      .for("update");
    if (!consignation) throw new Error("CONSIGNATION_NOT_FOUND");
    if (consignation.estado !== "PENDIENTE") throw new Error("ALREADY_LIQUIDATED");

    const detalles = await tx
      .select({
        id: consignmentDetails.id,
        presentacionId: consignmentDetails.presentacionId,
        cantidadEntregada: consignmentDetails.cantidadEntregada,
        precioConsignacion: consignmentDetails.precioConsignacion,
      })
      .from(consignmentDetails)
      .where(eq(consignmentDetails.consignacionId, id));

    const byPresentation = new Map(input.detalles.map((d) => [d.presentacionId, d]));
    if (byPresentation.size !== detalles.length) throw new Error("INVALID_LIQUIDATION");

    const now = new Date();
    let subtotalVentaCents = 0;
    const saleDetalles: Array<{
      presentacionId: number;
      cantidadVendida: number;
      precioConsignacion: string;
      importeVendido: string;
    }> = [];

    for (const det of detalles) {
      const entrada = byPresentation.get(det.presentacionId);
      if (!entrada) throw new Error("INVALID_LIQUIDATION");
      if (
        entrada.cantidadVendida < 0 ||
        entrada.cantidadDevuelta < 0 ||
        entrada.cantidadVendida + entrada.cantidadDevuelta !== det.cantidadEntregada
      ) {
        throw new Error("INVALID_LIQUIDATION");
      }

      const importeVendido = fromCents(entrada.cantidadVendida * toCents(det.precioConsignacion));

      await tx
        .update(consignmentDetails)
        .set({
          cantidadVendida: entrada.cantidadVendida,
          cantidadDevuelta: entrada.cantidadDevuelta,
          importeVendido,
        })
        .where(eq(consignmentDetails.id, det.id));

      if (entrada.cantidadDevuelta > 0) {
        const { stockAnterior, stockPosterior } = await adjustStock(
          tx,
          det.presentacionId,
          entrada.cantidadDevuelta,
          now,
        );

        await tx.insert(inventoryMovements).values({
          presentacionId: det.presentacionId,
          tipoMovimiento: "DEVOLUCION_CONSIGNACION",
          cantidad: entrada.cantidadDevuelta,
          stockAnterior,
          stockPosterior,
          referenciaTipo: "CONSIGNACION",
          referenciaId: id,
          usuarioId,
          fecha: now,
          observacion: `Devolución de consignación ${consignation.numero}`,
        });
      }

      if (entrada.cantidadVendida > 0) {
        subtotalVentaCents += toCents(importeVendido);
        saleDetalles.push({
          presentacionId: det.presentacionId,
          cantidadVendida: entrada.cantidadVendida,
          precioConsignacion: det.precioConsignacion,
          importeVendido,
        });
      }
    }

    const ventaNumero = `VTA-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    const totalVenta = fromCents(subtotalVentaCents);

    const [sale] = await tx
      .insert(sales)
      .values({
        numero: ventaNumero,
        clienteId: consignation.clienteId,
        usuarioId,
        fecha: now,
        subtotal: totalVenta,
        descuentoTotal: "0",
        total: totalVenta,
        estado: "COMPLETADA",
        observacion: `Venta generada por liquidación de consignación ${consignation.numero}`,
        consignacionId: id,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: sales.id, numero: sales.numero });

    for (const det of saleDetalles) {
      await tx.insert(saleDetails).values({
        ventaId: sale.id,
        presentacionId: det.presentacionId,
        cantidad: det.cantidadVendida,
        tipoPrecio: "CONSIGNACION",
        precioUnitario: det.precioConsignacion,
        descuentoPorcentaje: "0",
        descuentoMonto: "0",
        subtotal: det.importeVendido,
      });
    }

    await tx
      .update(consignations)
      .set({ estado: "LIQUIDADA", updatedAt: now })
      .where(eq(consignations.id, id));

    await tx.insert(auditLogs).values({
      usuarioId,
      accion: "LIQUIDAR_CONSIGNACION",
      entidad: "consignacion",
      entidadId: id,
      fecha: now,
      detalle: { numero: consignation.numero, ventaNumero: sale.numero },
    });

    return consignation;
  });
}