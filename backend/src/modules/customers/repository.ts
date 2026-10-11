import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { customers } from "../../db/schema/index.js";
import { optionalTrimOrNull, trimOrNull } from "../../lib/validation.js";
import type { CustomerCreateInput, CustomerUpdateInput } from "./schema.js";

export async function listCustomers(search?: string) {
  const term = search?.trim();
  return db
    .select()
    .from(customers)
    .where(
      term
        ? or(
            ilike(customers.nombre, `%${term}%`),
            ilike(customers.nitCi, `%${term}%`),
            ilike(customers.telefono, `%${term}%`),
            ilike(customers.email, `%${term}%`),
          )
        : undefined,
    )
    .orderBy(asc(customers.nombre));
}

export async function getCustomerById(id: number) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return customer;
}

export async function createCustomer(input: CustomerCreateInput) {
  const [customer] = await db
    .insert(customers)
    .values({
      nombre: input.nombre,
      nitCi: trimOrNull(input.nitCi),
      telefono: trimOrNull(input.telefono),
      email: trimOrNull(input.email),
      direccion: trimOrNull(input.direccion),
      activo: input.activo ?? true,
    })
    .returning();
  return customer;
}

export async function updateCustomer(id: number, input: CustomerUpdateInput) {
  const [customer] = await db
    .update(customers)
    .set({
      nombre: input.nombre,
      nitCi: optionalTrimOrNull(input.nitCi),
      telefono: optionalTrimOrNull(input.telefono),
      email: optionalTrimOrNull(input.email),
      direccion: optionalTrimOrNull(input.direccion),
      activo: input.activo,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id))
    .returning();
  return customer;
}
