import { like, sql } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Tx } from "./stock.js";

const pad = (n: number) => String(n).padStart(2, "0");

/** AAAAMMDD-HHMMSS en la hora local del servidor. */
export function timestampCode(date: Date): string {
  const day = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `${day}-${time}`;
}

export function formatDocumentNumber(prefix: string, date: Date, existing: number): string {
  const base = `${prefix}-${timestampCode(date)}`;
  return existing === 0 ? base : `${base}-${existing + 1}`;
}

/**
 * Número de documento a partir de la fecha y hora (p. ej. VTA-20261008-232715).
 * Si ya hay documentos en ese mismo segundo se agrega -2, -3, ...
 * El lock por prefijo serializa transacciones concurrentes hasta el commit.
 */
export async function nextDocumentNumber(
  tx: Tx,
  prefix: "VTA" | "CMP" | "CSG",
  table: PgTable,
  column: PgColumn,
  date = new Date(),
): Promise<string> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${prefix}))`);
  const [{ count }] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(table)
    .where(like(column, `${prefix}-${timestampCode(date)}%`));
  return formatDocumentNumber(prefix, date, count);
}
