import { categoryCreateSchema, categoryUpdateSchema } from "./schema.js";
import * as repository from "./repository.js";

export async function listCategories(search?: string) {
  return repository.listCategories(search);
}

export async function getCategory(id: number) {
  const category = await repository.getCategoryById(id);
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function createCategory(body: unknown) {
  const input = categoryCreateSchema.parse(body);
  return repository.createCategory(input);
}

export async function updateCategory(id: number, body: unknown) {
  await getCategory(id);
  const input = categoryUpdateSchema.parse(body);
  return repository.updateCategory(id, input);
}

export async function setCategoryStatus(id: number, activo: boolean) {
  await getCategory(id);
  return repository.updateCategory(id, { activo });
}
