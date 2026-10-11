import { and, asc, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { categories, productPresentations, products, purchaseDetails } from "../../db/schema/index.js";
import type { Tx } from "../../lib/stock.js";
import type { PresentacionUpdateInput, ProductCreateInput, ProductUpdateInput } from "./schema.js";

export function generateCodigo(abreviacion: string, cantidad: string | number): string {
  const abrev = abreviacion.trim().toUpperCase();
  const num = Math.trunc(Number(cantidad));
  return `${abrev}-${String(num).padStart(3, "0")}`;
}

const productSelection = {
  id: products.id,
  nombre: products.nombre,
  abreviacion: products.abreviacion,
  descripcion: products.descripcion,
  categoriaId: products.categoriaId,
  categoriaNombre: categories.nombre,
  activo: products.activo,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
};

const presentationSelection = {
  id: productPresentations.id,
  productoId: productPresentations.productoId,
  codigo: productPresentations.codigo,
  cantidad: productPresentations.cantidad,
  unidadMedida: productPresentations.unidadMedida,
  pvp: productPresentations.pvp,
  stockActual: productPresentations.stockActual,
  stockMinimo: productPresentations.stockMinimo,
  activo: productPresentations.activo,
  createdAt: productPresentations.createdAt,
  updatedAt: productPresentations.updatedAt,
};

/** Último precio de compra de cada presentación (informativo). */
async function lastPurchasePrices(presentationIds: number[]) {
  const rows = await db
    .select({ presentacionId: purchaseDetails.presentacionId, precio: purchaseDetails.precioUnitario })
    .from(purchaseDetails)
    .where(inArray(purchaseDetails.presentacionId, presentationIds))
    .orderBy(desc(purchaseDetails.id));

  const prices = new Map<number, string>();
  for (const row of rows) {
    if (!prices.has(row.presentacionId)) prices.set(row.presentacionId, row.precio);
  }
  return prices;
}

export async function listProducts(search?: string, includeInactive = true) {
  const term = search?.trim();
  const pattern = `%${term}%`;

  // Con búsqueda, un producto coincide por nombre, abreviación o el código de alguna presentación.
  let matchingProductIds: number[] = [];
  if (term) {
    const matching = await db
      .select({ productoId: productPresentations.productoId })
      .from(productPresentations)
      .where(ilike(productPresentations.codigo, pattern));
    matchingProductIds = matching.map((m) => m.productoId);
  }

  const codeFilter = matchingProductIds.length > 0 ? inArray(products.id, matchingProductIds) : undefined;
  const searchFilter = term
    ? or(ilike(products.nombre, pattern), ilike(products.abreviacion, pattern), codeFilter)
    : undefined;

  const baseRows = await db
    .select(productSelection)
    .from(products)
    .leftJoin(categories, eq(products.categoriaId, categories.id))
    .where(and(searchFilter, includeInactive ? undefined : eq(products.activo, true)))
    .orderBy(asc(products.nombre));

  if (baseRows.length === 0) return [];

  const presentations = await db
    .select(presentationSelection)
    .from(productPresentations)
    .where(
      inArray(
        productPresentations.productoId,
        baseRows.map((p) => p.id),
      ),
    )
    .orderBy(asc(productPresentations.cantidad));

  const prices = await lastPurchasePrices(presentations.map((p) => p.id));

  const grouped = new Map<number, typeof presentations>();
  for (const pres of presentations) {
    const arr = grouped.get(pres.productoId) ?? [];
    arr.push(pres);
    grouped.set(pres.productoId, arr);
  }

  return baseRows.map((prod) => ({
    ...prod,
    presentaciones: (grouped.get(prod.id) ?? []).map((pres) => ({
      ...pres,
      ultimoPrecioCompra: prices.get(pres.id) ?? null,
    })),
  }));
}

export async function getProductById(id: number) {
  const [product] = await db
    .select(productSelection)
    .from(products)
    .leftJoin(categories, eq(products.categoriaId, categories.id))
    .where(eq(products.id, id))
    .limit(1);
  if (!product) return null;

  const presentations = await db
    .select(presentationSelection)
    .from(productPresentations)
    .where(eq(productPresentations.productoId, id))
    .orderBy(asc(productPresentations.cantidad));

  const prices = await lastPurchasePrices(presentations.map((p) => p.id));

  return {
    ...product,
    presentaciones: presentations.map((pres) => ({
      ...pres,
      ultimoPrecioCompra: prices.get(pres.id) ?? null,
    })),
  };
}

export async function getProductByAbreviacion(abreviacion: string, excludeId?: number) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.abreviacion, abreviacion.toUpperCase()),
        excludeId ? ne(products.id, excludeId) : undefined,
      ),
    )
    .limit(1);
  return product;
}

export async function getPresentationByCodigo(codigo: string, excludeId?: number) {
  const [pres] = await db
    .select({ id: productPresentations.id })
    .from(productPresentations)
    .where(and(eq(productPresentations.codigo, codigo), excludeId ? ne(productPresentations.id, excludeId) : undefined))
    .limit(1);
  return pres;
}

export async function createProduct(input: ProductCreateInput & { codigoMap: Map<number, string> }) {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        nombre: input.nombre,
        abreviacion: input.abreviacion.toUpperCase(),
        descripcion: input.descripcion || null,
        categoriaId: input.categoriaId || null,
        activo: input.activo ?? true,
      })
      .returning({ id: products.id });

    const presValues = input.presentaciones.map((pres, idx) => ({
      productoId: product.id,
      codigo: input.codigoMap.get(idx)!,
      cantidad: String(pres.cantidad),
      unidadMedida: pres.unidadMedida,
      pvp: String(pres.pvp),
      stockActual: 0,
      stockMinimo: pres.stockMinimo ?? 0,
      activo: pres.activo ?? true,
    }));

    if (presValues.length > 0) {
      await tx.insert(productPresentations).values(presValues);
    }

    return product.id;
  });
}

async function upsertPresentations(
  tx: Tx,
  productId: number,
  presentaciones: PresentacionUpdateInput[],
  codigoMap?: Map<number, string>,
) {
  const current = await tx.select().from(productPresentations).where(eq(productPresentations.productoId, productId));

  for (const [idx, pres] of presentaciones.entries()) {
    const codigo = codigoMap?.get(idx);

    if (pres.id) {
      const existing = current.find((c) => c.id === pres.id);
      if (!existing) throw new Error("PRESENTATION_NOT_FOUND");
      if (existing.productoId !== productId) throw new Error("PRESENTATION_MISMATCH");

      await tx
        .update(productPresentations)
        .set({
          codigo: codigo ?? existing.codigo,
          cantidad: String(pres.cantidad),
          unidadMedida: pres.unidadMedida,
          pvp: String(pres.pvp),
          stockMinimo: pres.stockMinimo,
          activo: pres.activo,
          updatedAt: new Date(),
        })
        .where(eq(productPresentations.id, pres.id));
    } else {
      if (!codigo) throw new Error("CODIGO_GENERATION_FAILED");
      await tx.insert(productPresentations).values({
        productoId: productId,
        codigo,
        cantidad: String(pres.cantidad),
        unidadMedida: pres.unidadMedida,
        pvp: String(pres.pvp),
        stockActual: 0,
        stockMinimo: pres.stockMinimo ?? 0,
        activo: pres.activo ?? true,
      });
    }
  }
}

export async function updateProduct(id: number, input: ProductUpdateInput & { codigoMap?: Map<number, string> }) {
  return db.transaction(async (tx) => {
    const touchesProduct = [input.nombre, input.abreviacion, input.descripcion, input.categoriaId, input.activo].some(
      (value) => value !== undefined,
    );

    if (touchesProduct) {
      await tx
        .update(products)
        .set({
          nombre: input.nombre,
          abreviacion: input.abreviacion?.toUpperCase(),
          descripcion: input.descripcion === undefined ? undefined : input.descripcion || null,
          categoriaId: input.categoriaId === undefined ? undefined : input.categoriaId || null,
          activo: input.activo,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));
    }

    if (input.presentaciones) {
      await upsertPresentations(tx, id, input.presentaciones, input.codigoMap);
    }

    return id;
  });
}

export async function setProductStatus(id: number, activo: boolean) {
  await db.update(products).set({ activo, updatedAt: new Date() }).where(eq(products.id, id));
  return getProductById(id);
}
