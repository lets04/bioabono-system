import { and, eq, gte, sql } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { productPresentations } from "../db/schema/index.js";

export type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Ajusta el stock de una presentación en un solo UPDATE atómico.
 * delta > 0 suma (compra, devolución); delta < 0 resta y exige stock suficiente.
 * Evita la condición de carrera leer→calcular→escribir entre transacciones concurrentes.
 */
export async function adjustStock(tx: Tx, presentacionId: number, delta: number, now = new Date()) {
  const where =
    delta < 0
      ? and(eq(productPresentations.id, presentacionId), gte(productPresentations.stockActual, -delta))
      : eq(productPresentations.id, presentacionId);

  const [row] = await tx
    .update(productPresentations)
    .set({ stockActual: sql`${productPresentations.stockActual} + ${delta}`, updatedAt: now })
    .where(where)
    .returning({ stockPosterior: productPresentations.stockActual });

  if (!row) {
    throw new Error(
      delta < 0 ? `STOCK_INSUFFICIENT:${presentacionId}` : `PRESENTATION_NOT_FOUND:${presentacionId}`,
    );
  }

  return { stockAnterior: row.stockPosterior - delta, stockPosterior: row.stockPosterior };
}
