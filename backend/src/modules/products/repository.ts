import { and, asc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { categories, productPresentations, products, purchaseDetails } from "../../db/schema/index.js";
import type { ProductCreateInput, ProductUpdateInput } from "./schema.js";

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

export async function listProducts(search?: string, includeInactive = true) {
  const term = search?.trim();

  // Build base query for products
  const conditions = [
    term
      ? or(
          ilike(products.nombre, `%${term}%`),
          ilike(products.abreviacion, `%${term}%`),
          ilike(products.descripcion, `%${term}%`),
        )
      : undefined,
    includeInactive ? undefined : eq(products.activo, true),
  ].filter(Boolean);

  // If searching, also need to match presentation codigo — fetch product ids that have matching presentation
  let matchingProductIds: number[] | undefined;
  if (term) {
    const matching = await db
      .select({ productoId: productPresentations.productoId })
      .from(productPresentations)
      .where(ilike(productPresentations.codigo, `%${term}%`));
    if (matching.length > 0) {
      matchingProductIds = matching.map((m) => m.productoId);
    }
  }

  const productConditions = [...conditions] as any[];
  if (term && matchingProductIds && matchingProductIds.length > 0) {
    // Include products that match via presentation codigo
    productConditions.shift(); // remove previous or handling? Simpler: build combined or
  }

  // Simpler: fetch all filtered by product fields, then if term, also fetch those matching presentation codigo and merge
  let baseRows = await db
    .select(productSelection)
    .from(products)
    .leftJoin(categories, eq(products.categoriaId, categories.id))
    .where(
      (() => {
        if (!term) return productConditions.length > 0 ? and(...productConditions) : undefined;
        // term filtering: product name/abreviacion OR presentation codigo
        if (matchingProductIds && matchingProductIds.length > 0) {
          return or(
            ilike(products.nombre, `%${term}%`),
            ilike(products.abreviacion, `%${term}%`),
            sql`${products.id} IN (${sql.join(
              matchingProductIds.map((id) => sql`${id}`),
              sql`,`,
            )})`,
          );
        }
        return or(ilike(products.nombre, `%${term}%`), ilike(products.abreviacion, `%${term}%`));
      })(),
    )
    .orderBy(asc(products.nombre));

  if (!includeInactive) {
    baseRows = baseRows.filter((r) => r.activo);
  }

  if (baseRows.length === 0) return [];

  const productIds = baseRows.map((p) => p.id);
  const presentations = await db
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
      createdAt: productPresentations.createdAt,
      updatedAt: productPresentations.updatedAt,
    })
    .from(productPresentations)
    .where(sql`${productPresentations.productoId} IN (${sql.join(productIds.map((id) => sql`${id}`), sql`,`)})`)
    .orderBy(asc(productPresentations.cantidad));

  // Fetch ultimo precio de compra per presentation (informative)
  const ultimoPrecios = await db
    .select({
      presentacionId: purchaseDetails.presentacionId,
      precio: purchaseDetails.precioUnitario,
    })
    .from(purchaseDetails)
    .where(sql`${purchaseDetails.presentacionId} IN (${sql.join(productIds.length ? presentations.map((p) => sql`${p.id}`) : [sql`0`], sql`,`)})`)
    .orderBy(sql`${purchaseDetails.id} DESC`);

  // Build map of ultimo precio (first occurrence per presentacion)
  const ultimoMap = new Map<number, string>();
  for (const row of ultimoPrecios) {
    if (!ultimoMap.has(row.presentacionId)) ultimoMap.set(row.presentacionId, row.precio);
  }

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
      ultimoPrecioCompra: ultimoMap.get(pres.id) ?? null,
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
      createdAt: productPresentations.createdAt,
      updatedAt: productPresentations.updatedAt,
    })
    .from(productPresentations)
    .where(eq(productPresentations.productoId, id))
    .orderBy(asc(productPresentations.cantidad));

  const ultimoPrecios = await db
    .select({
      presentacionId: purchaseDetails.presentacionId,
      precio: purchaseDetails.precioUnitario,
    })
    .from(purchaseDetails)
    .where(sql`${purchaseDetails.presentacionId} IN (${sql.join(presentations.length ? presentations.map((p) => sql`${p.id}`) : [sql`0`], sql`,`)})`)
    .orderBy(sql`${purchaseDetails.id} DESC`);

  const ultimoMap = new Map<number, string>();
  for (const row of ultimoPrecios) {
    if (!ultimoMap.has(row.presentacionId)) ultimoMap.set(row.presentacionId, row.precio);
  }

  return {
    ...product,
    presentaciones: presentations.map((pres) => ({
      ...pres,
      ultimoPrecioCompra: ultimoMap.get(pres.id) ?? null,
    })),
  };
}

export async function getProductByAbreviacion(abreviacion: string, excludeId?: number) {
  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(excludeId ? and(eq(products.abreviacion, abreviacion.toUpperCase()), ne(products.id, excludeId)) : eq(products.abreviacion, abreviacion.toUpperCase()))
    .limit(1);
  return product;
}

export async function getPresentationByCodigo(codigo: string, excludeId?: number) {
  const [pres] = await db
    .select({ id: productPresentations.id })
    .from(productPresentations)
    .where(excludeId ? and(eq(productPresentations.codigo, codigo), ne(productPresentations.id, excludeId)) : eq(productPresentations.codigo, codigo))
    .limit(1);
  return pres;
}

export async function getPresentationById(id: number) {
  const [pres] = await db.select().from(productPresentations).where(eq(productPresentations.id, id)).limit(1);
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

export async function updateProduct(id: number, input: ProductUpdateInput & { codigoMap?: Map<number, string> }) {
  return db.transaction(async (tx) => {
    if (input.nombre !== undefined || input.abreviacion !== undefined || input.descripcion !== undefined || input.categoriaId !== undefined || input.activo !== undefined) {
      await tx
        .update(products)
        .set({
          nombre: input.nombre,
          abreviacion: input.abreviacion ? input.abreviacion.toUpperCase() : undefined,
          descripcion: input.descripcion === undefined ? undefined : input.descripcion || null,
          categoriaId: input.categoriaId === undefined ? undefined : input.categoriaId || null,
          activo: input.activo,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));
    }

    if (input.presentaciones) {
      // Fetch current presentations for this product
      const current = await tx.select().from(productPresentations).where(eq(productPresentations.productoId, id));

      for (let idx = 0; idx < input.presentaciones.length; idx++) {
        const presInput: any = input.presentaciones[idx];
        const codigo = input.codigoMap?.get(idx);

        if (presInput.id) {
          // Update existing
          const existing = current.find((c) => c.id === presInput.id);
          if (!existing) throw new Error("PRESENTATION_NOT_FOUND");
          if (existing.productoId !== id) throw new Error("PRESENTATION_MISMATCH");

          await tx
            .update(productPresentations)
            .set({
              codigo: codigo ?? existing.codigo,
              cantidad: String(presInput.cantidad),
              unidadMedida: presInput.unidadMedida,
              pvp: String(presInput.pvp),
              stockMinimo: presInput.stockMinimo,
              activo: presInput.activo,
              updatedAt: new Date(),
            })
            .where(eq(productPresentations.id, presInput.id));
        } else {
          // Create new presentation
          if (!codigo) throw new Error("CODIGO_GENERATION_FAILED");
          await tx.insert(productPresentations).values({
            productoId: id,
            codigo,
            cantidad: String(presInput.cantidad),
            unidadMedida: presInput.unidadMedida,
            pvp: String(presInput.pvp),
            stockActual: 0,
            stockMinimo: presInput.stockMinimo ?? 0,
            activo: presInput.activo ?? true,
          });
        }
      }
    }

    return id;
  });
}

export async function setProductStatus(id: number, activo: boolean) {
  await db.update(products).set({ activo, updatedAt: new Date() }).where(eq(products.id, id));
  return getProductById(id);
}
