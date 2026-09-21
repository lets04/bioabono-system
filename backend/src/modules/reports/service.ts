import * as repository from "./repository.js";
import { reportFiltersSchema } from "./schema.js";
import {
  buildInventoryWorkbook,
  buildProductsWorkbook,
  buildPurchasesWorkbook,
  buildSalesWorkbook,
} from "./excel.js";
import { db } from "../../db/index.js";
import { categories, customers, suppliers } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function getPurchasesReport(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  return repository.getPurchasesReport(filters);
}

export async function getSalesReport(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  return repository.getSalesReport(filters);
}

export async function getInventoryReport(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  return repository.getInventoryReport(filters);
}

export async function getProductsReport(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  return repository.getProductsReport(filters);
}

export async function exportPurchasesExcel(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  const data = await repository.getPurchasesReport(filters);
  let proveedorNombre: string | undefined;
  if (filters.proveedorId) {
    const [sup] = await db.select({ nombre: suppliers.nombre }).from(suppliers).where(eq(suppliers.id, filters.proveedorId)).limit(1);
    proveedorNombre = sup?.nombre;
  }
  const buffer = await buildPurchasesWorkbook(data, {
    from: filters.from ?? undefined,
    to: filters.to ?? undefined,
    proveedorNombre,
  });
  const date = new Date().toISOString().slice(0, 10);
  return { buffer, filename: `reporte-compras-${date}.xlsx` };
}

export async function exportSalesExcel(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  const data = await repository.getSalesReport(filters);
  let clienteNombre: string | undefined;
  if (filters.clienteId) {
    const [cli] = await db.select({ nombre: customers.nombre }).from(customers).where(eq(customers.id, filters.clienteId)).limit(1);
    clienteNombre = cli?.nombre;
  }
  const buffer = await buildSalesWorkbook(data, {
    from: filters.from ?? undefined,
    to: filters.to ?? undefined,
    clienteNombre,
    tipoPrecio: filters.tipoPrecio ?? undefined,
  });
  const date = new Date().toISOString().slice(0, 10);
  return { buffer, filename: `reporte-ventas-${date}.xlsx` };
}

export async function exportInventoryExcel(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  const data = await repository.getInventoryReport(filters);
  let categoriaNombre: string | undefined;
  if (filters.categoriaId) {
    const [cat] = await db.select({ nombre: categories.nombre }).from(categories).where(eq(categories.id, filters.categoriaId)).limit(1);
    categoriaNombre = cat?.nombre;
  }
  const buffer = await buildInventoryWorkbook(data, {
    categoriaNombre,
    estado: filters.estado ?? undefined,
  });
  const date = new Date().toISOString().slice(0, 10);
  return { buffer, filename: `reporte-inventario-${date}.xlsx` };
}

export async function exportProductsExcel(query: unknown) {
  const filters = reportFiltersSchema.parse(query);
  const data = await repository.getProductsReport(filters);
  let categoriaNombre: string | undefined;
  if (filters.categoriaId) {
    const [cat] = await db.select({ nombre: categories.nombre }).from(categories).where(eq(categories.id, filters.categoriaId)).limit(1);
    categoriaNombre = cat?.nombre;
  }
  const buffer = await buildProductsWorkbook(data, {
    categoriaNombre,
    estado: filters.estado ?? undefined,
  });
  const date = new Date().toISOString().slice(0, 10);
  return { buffer, filename: `reporte-productos-${date}.xlsx` };
}
