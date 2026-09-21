import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { categories } from "../../db/schema/index.js";
import type { CategoryCreateInput, CategoryUpdateInput } from "./schema.js";

export async function listCategories(search?: string) {
  const term = search?.trim();

  return db
    .select()
    .from(categories)
    .where(term ? or(ilike(categories.nombre, `%${term}%`), ilike(categories.descripcion, `%${term}%`)) : undefined)
    .orderBy(asc(categories.nombre));
}

export async function getCategoryById(id: number) {
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return category;
}

export async function createCategory(input: CategoryCreateInput) {
  const [category] = await db
    .insert(categories)
    .values({
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      activo: input.activo ?? true
    })
    .returning();

  return category;
}

export async function updateCategory(id: number, input: CategoryUpdateInput) {
  const [category] = await db
    .update(categories)
    .set({
      ...input,
      descripcion: input.descripcion === undefined ? undefined : input.descripcion || null,
      updatedAt: new Date()
    })
    .where(eq(categories.id, id))
    .returning();

  return category;
}
