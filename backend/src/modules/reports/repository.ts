import { and, asc, desc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  categories,
  consignmentDetails,
  consignations,
  customers,
  productPresentations,
  products,
  purchaseDetails,
  purchases,
  saleDetails,
  sales,
  suppliers,
} from "../../db/schema/index.js";
import type { ReportFilters } from "./schema.js";
import { env } from "../../config/env.js";

// Un filtro "YYYY-MM-DD" se interpreta como inicio del día en la zona del negocio, no en UTC.
function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00${env.businessUtcOffset}`)
    : new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Desde el inicio de `from` hasta el último milisegundo del día `to`. */
function dateRange(filters: ReportFilters) {
  const from = parseDate(filters.from);
  const to = parseDate(filters.to);
  const toEnd = to ? new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) : undefined;
  return { from, toEnd };
}

type StockStatus = "sin" | "bajo" | "normal";

function stockStatus(stockActual: number, stockMinimo: number): StockStatus {
  if (stockActual === 0) return "sin";
  if (stockActual <= stockMinimo) return "bajo";
  return "normal";
}

const isStockStatus = (estado: ReportFilters["estado"]): estado is StockStatus =>
  estado === "sin" || estado === "bajo" || estado === "normal";

// PURCHASES REPORT
export async function getPurchasesReport(filters: ReportFilters) {
  const { from, toEnd } = dateRange(filters);

  const conditions: SQL[] = [];
  if (from) conditions.push(gte(purchases.fecha, from));
  if (toEnd) conditions.push(lte(purchases.fecha, toEnd));
  if (filters.proveedorId) conditions.push(eq(purchases.proveedorId, filters.proveedorId));

  const rows = await db
    .select({
      id: purchases.id,
      numero: purchases.numero,
      fecha: purchases.fecha,
      proveedorId: purchases.proveedorId,
      proveedorNombre: suppliers.nombre,
      subtotal: purchases.subtotal,
      descuento: purchases.descuento,
      total: purchases.total,
      estado: purchases.estado,
      presentacionId: purchaseDetails.presentacionId,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
      cantidad: purchaseDetails.cantidad,
      precioUnitario: purchaseDetails.precioUnitario,
      detalleSubtotal: purchaseDetails.subtotal,
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.proveedorId, suppliers.id))
    .innerJoin(purchaseDetails, eq(purchaseDetails.compraId, purchases.id))
    .leftJoin(productPresentations, eq(purchaseDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(and(...conditions))
    .orderBy(desc(purchases.fecha), asc(purchaseDetails.id));

  // Summary per purchase and overall
  const purchaseIds = [...new Set(rows.map((r) => r.id))];
  const summaryRows =
    purchaseIds.length > 0
      ? await db
          .select({
            total: sql<string>`sum(${purchases.total}::numeric)`,
            count: sql<number>`count(*)::int`,
          })
          .from(purchases)
          .where(and(...conditions))
      : [];

  const porProveedor =
    purchaseIds.length > 0
      ? await db
          .select({
            proveedorId: suppliers.id,
            proveedorNombre: suppliers.nombre,
            total: sql<string>`sum(${purchases.total}::numeric)`,
            count: sql<number>`count(*)::int`,
          })
          .from(purchases)
          .leftJoin(suppliers, eq(purchases.proveedorId, suppliers.id))
          .where(and(...conditions))
          .groupBy(suppliers.id, suppliers.nombre)
          .orderBy(desc(sql`sum(${purchases.total}::numeric)`))
      : [];

  const totals = summaryRows[0] ?? { total: "0", count: 0 };

  return {
    rows,
    summary: {
      cantidadCompras: Number(totals.count ?? 0),
      totalCompras: totals.total ?? "0.00",
      porProveedor,
    },
  };
}

// SALES REPORT
export async function getSalesReport(filters: ReportFilters) {
  const { from, toEnd } = dateRange(filters);

  const conditions: SQL[] = [];
  if (from) conditions.push(gte(sales.fecha, from));
  if (toEnd) conditions.push(lte(sales.fecha, toEnd));
  if (filters.clienteId) conditions.push(eq(sales.clienteId, filters.clienteId));
  // El tipo de precio se guarda por línea, así que filtra el detalle.
  if (filters.tipoPrecio) conditions.push(eq(saleDetails.tipoPrecio, filters.tipoPrecio));

  const rows = await db
    .select({
      id: sales.id,
      numero: sales.numero,
      fecha: sales.fecha,
      clienteId: sales.clienteId,
      clienteNombre: customers.nombre,
      tipoPrecio: saleDetails.tipoPrecio,
      consignacionId: sales.consignacionId,
      consignacionNumero: consignations.numero,
      presentacionId: saleDetails.presentacionId,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      cantidad: saleDetails.cantidad,
      precioUnitario: saleDetails.precioUnitario,
      descuentoPorcentaje: saleDetails.descuentoPorcentaje,
      descuentoMonto: saleDetails.descuentoMonto,
      detalleSubtotal: saleDetails.subtotal,
      ventaSubtotal: sales.subtotal,
      ventaDescuentoTotal: sales.descuentoTotal,
      ventaTotal: sales.total,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.clienteId, customers.id))
    .leftJoin(consignations, eq(sales.consignacionId, consignations.id))
    .innerJoin(saleDetails, eq(saleDetails.ventaId, sales.id))
    .leftJoin(productPresentations, eq(saleDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(and(...conditions))
    .orderBy(desc(sales.fecha), asc(saleDetails.id));

  // Los totales salen de las líneas filtradas para respetar el filtro por tipo de precio.
  const summary = {
    cantidadVentas: new Set(rows.map((r) => r.id)).size,
    unidadesVendidas: rows.reduce((sum, r) => sum + r.cantidad, 0),
    totalDescuentos: rows.reduce((sum, r) => sum + Number(r.descuentoMonto) * r.cantidad, 0).toFixed(2),
    totalVentas: rows.reduce((sum, r) => sum + Number(r.detalleSubtotal), 0).toFixed(2),
  };

  return { rows, summary };
}

// INVENTORY REPORT
export async function getInventoryReport(filters: ReportFilters) {
  const conditions: SQL[] = [];
  if (filters.categoriaId) conditions.push(eq(products.categoriaId, filters.categoriaId));

  const rows = await db
    .select({
      id: productPresentations.id,
      codigo: productPresentations.codigo,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
      categoriaId: products.categoriaId,
      categoriaNombre: categories.nombre,
      cantidad: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      pvp: productPresentations.pvp,
      stockActual: productPresentations.stockActual,
      stockMinimo: productPresentations.stockMinimo,
      activo: productPresentations.activo,
      productoActivo: products.activo,
    })
    .from(productPresentations)
    .innerJoin(products, eq(productPresentations.productoId, products.id))
    .leftJoin(categories, eq(products.categoriaId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(productPresentations.codigo));

  const { estado } = filters;
  const filtered =
    estado && estado !== "todos" ? rows.filter((r) => stockStatus(r.stockActual, r.stockMinimo) === estado) : rows;

  const summary = {
    totalPresentaciones: filtered.length,
    sinStock: filtered.filter((r) => r.stockActual === 0).length,
    bajoStock: filtered.filter((r) => r.stockActual > 0 && r.stockActual <= r.stockMinimo).length,
    normalStock: filtered.filter((r) => r.stockActual > r.stockMinimo).length,
  };

  return { rows: filtered, summary };
}

// PRODUCTS REPORT
export async function getProductsReport(filters: ReportFilters) {
  const conditions: SQL[] = [];
  if (filters.categoriaId) conditions.push(eq(products.categoriaId, filters.categoriaId));
  if (filters.estado === "activo") conditions.push(eq(products.activo, true));
  if (filters.estado === "inactivo") conditions.push(eq(products.activo, false));

  const baseRows = await db
    .select({
      id: products.id,
      nombre: products.nombre,
      abreviacion: products.abreviacion,
      descripcion: products.descripcion,
      categoriaId: products.categoriaId,
      categoriaNombre: categories.nombre,
      activo: products.activo,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoriaId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(products.nombre));

  if (baseRows.length === 0) return { rows: [], summary: { totalProductos: 0, totalPresentaciones: 0 } };

  const presentaciones = (
    await db
      .select({
        id: productPresentations.id,
        productoId: productPresentations.productoId,
        codigo: productPresentations.codigo,
        cantidad: productPresentations.cantidad,
        unidadMedida: productPresentations.unidadMedida,
        pvp: productPresentations.pvp,
        stockActual: productPresentations.stockActual,
        stockMinimo: productPresentations.stockMinimo,
        activo: productPresentations.activo,
      })
      .from(productPresentations)
      .where(
        inArray(
          productPresentations.productoId,
          baseRows.map((p) => p.id),
        ),
      )
      .orderBy(asc(productPresentations.codigo))
  ).map((pres) => ({ ...pres, presentacionEstado: stockStatus(pres.stockActual, pres.stockMinimo) }));

  // Último precio de compra por presentación
  const ultimoPrecios = await db
    .select({ presentacionId: purchaseDetails.presentacionId, precio: purchaseDetails.precioUnitario })
    .from(purchaseDetails)
    .where(
      inArray(
        purchaseDetails.presentacionId,
        presentaciones.map((p) => p.id),
      ),
    )
    .orderBy(desc(purchaseDetails.id));

  const ultimoMap = new Map<number, string>();
  for (const r of ultimoPrecios) {
    if (!ultimoMap.has(r.presentacionId)) ultimoMap.set(r.presentacionId, r.precio);
  }

  const { estado } = filters;
  const filteredPresentaciones = presentaciones.filter((p) => {
    if (isStockStatus(estado)) return p.presentacionEstado === estado;
    if (estado === "activo") return p.activo;
    if (estado === "inactivo") return !p.activo;
    return true;
  });

  const productsById = new Map(baseRows.map((p) => [p.id, p]));
  const rows = filteredPresentaciones.map((pres) => {
    const prod = productsById.get(pres.productoId)!;
    return {
      ...pres,
      productoNombre: prod.nombre,
      productoAbreviacion: prod.abreviacion,
      categoriaNombre: prod.categoriaNombre,
      categoriaId: prod.categoriaId,
      productoActivo: prod.activo,
      ultimoPrecioCompra: ultimoMap.get(pres.id) ?? null,
    };
  });

  // If estado was presentacion-specific, we may have filtered out some products entirely; for products report we show presentaciones
  return {
    rows,
    summary: {
      totalProductos: new Set(rows.map((r) => r.productoId)).size,
      totalPresentaciones: rows.length,
      sinStock: rows.filter((r) => r.stockActual === 0).length,
      bajoStock: rows.filter((r) => r.stockActual > 0 && r.stockActual <= r.stockMinimo).length,
    },
  };
}

// CONSIGNATIONS REPORT
export async function getConsignationsReport(filters: ReportFilters) {
  const { from, toEnd } = dateRange(filters);

  const conditions: SQL[] = [];
  if (from) conditions.push(gte(consignations.fechaEntrega, from));
  if (toEnd) conditions.push(lte(consignations.fechaEntrega, toEnd));
  if (filters.estado === "PENDIENTE" || filters.estado === "LIQUIDADA")
    conditions.push(eq(consignations.estado, filters.estado));

  const rows = await db
    .select({
      id: consignations.id,
      numero: consignations.numero,
      fechaEntrega: consignations.fechaEntrega,
      clienteId: consignations.clienteId,
      clienteNombre: customers.nombre,
      estado: consignations.estado,
      observacion: consignations.observacion,
      presentacionId: consignmentDetails.presentacionId,
      codigo: productPresentations.codigo,
      cantidadPresentacion: productPresentations.cantidad,
      unidadMedida: productPresentations.unidadMedida,
      productoNombre: products.nombre,
      productoAbreviacion: products.abreviacion,
      cantidadEntregada: consignmentDetails.cantidadEntregada,
      cantidadVendida: consignmentDetails.cantidadVendida,
      cantidadDevuelta: consignmentDetails.cantidadDevuelta,
      precioConsignacion: consignmentDetails.precioConsignacion,
      importeVendido: consignmentDetails.importeVendido,
    })
    .from(consignations)
    .leftJoin(customers, eq(consignations.clienteId, customers.id))
    .innerJoin(consignmentDetails, eq(consignmentDetails.consignacionId, consignations.id))
    .leftJoin(productPresentations, eq(consignmentDetails.presentacionId, productPresentations.id))
    .leftJoin(products, eq(productPresentations.productoId, products.id))
    .where(and(...conditions))
    .orderBy(desc(consignations.fechaEntrega), asc(consignmentDetails.id));

  const consignationIds = [...new Set(rows.map((r) => r.id))];
  const summaryRows =
    consignationIds.length > 0
      ? await db
          .select({
            estado: consignations.estado,
            count: sql<number>`count(*)::int`,
          })
          .from(consignations)
          .where(and(...conditions))
          .groupBy(consignations.estado)
      : [];

  const pendientes = summaryRows.find((r) => r.estado === "PENDIENTE")?.count ?? 0;
  const liquidadas = summaryRows.find((r) => r.estado === "LIQUIDADA")?.count ?? 0;
  const totalVendido = rows.reduce((sum, r) => sum + Number(r.importeVendido), 0);

  return {
    rows,
    summary: {
      cantidadConsignaciones: consignationIds.length,
      pendientes,
      liquidadas,
      totalVendido: totalVendido.toFixed(2),
    },
  };
}
