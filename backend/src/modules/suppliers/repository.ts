import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { suppliers } from "../../db/schema/index.js";
import type { SupplierCreateInput, SupplierUpdateInput } from "./schema.js";

export async function listSuppliers(search?: string) {
  const term = search?.trim();
  return db
    .select()
    .from(suppliers)
    .where(
      term
        ? or(
            ilike(suppliers.nombre, `%${term}%`),
            ilike(suppliers.nit, `%${term}%`),
            ilike(suppliers.telefono, `%${term}%`),
            ilike(suppliers.email, `%${term}%`),
          )
        : undefined,
    )
    .orderBy(asc(suppliers.nombre));
}

export async function getSupplierById(id: number) {
  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return supplier;
}

export async function createSupplier(input: SupplierCreateInput) {
  const [supplier] = await db
    .insert(suppliers)
    .values({
      nombre: input.nombre,
      nit: input.nit?.trim() ? input.nit.trim() : null,
      telefono: input.telefono?.trim() ? input.telefono.trim() : null,
      email: input.email?.trim() ? input.email.trim() : null,
      direccion: input.direccion?.trim() ? input.direccion.trim() : null,
      activo: input.activo ?? true,
    })
    .returning();
  return supplier;
}

export async function updateSupplier(id: number, input: SupplierUpdateInput) {
  const [supplier] = await db
    .update(suppliers)
    .set({
      nombre: input.nombre,
      nit: input.nit !== undefined ? (input.nit?.trim() ? input.nit.trim() : null) : undefined,
      telefono: input.telefono !== undefined ? (input.telefono?.trim() ? input.telefono.trim() : null) : undefined,
      email: input.email !== undefined ? (input.email?.trim() ? input.email.trim() : null) : undefined,
      direccion: input.direccion !== undefined ? (input.direccion?.trim() ? input.direccion.trim() : null) : undefined,
      activo: input.activo,
      updatedAt: new Date(),
    })
    .where(eq(suppliers.id, id))
    .returning();
  return supplier;
}
