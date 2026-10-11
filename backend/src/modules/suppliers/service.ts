import * as repository from "./repository.js";
import { supplierCreateSchema, supplierUpdateSchema } from "./schema.js";

export async function listSuppliers(search?: string) {
  return repository.listSuppliers(search);
}

export async function getSupplier(id: number) {
  const supplier = await repository.getSupplierById(id);
  if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");
  return supplier;
}

export async function createSupplier(body: unknown) {
  return repository.createSupplier(supplierCreateSchema.parse(body));
}

export async function updateSupplier(id: number, body: unknown) {
  await getSupplier(id);
  const input = supplierUpdateSchema.parse(body);
  const updated = await repository.updateSupplier(id, input);
  if (!updated) throw new Error("SUPPLIER_NOT_FOUND");
  return updated;
}

export async function setSupplierStatus(id: number, activo: boolean) {
  await getSupplier(id);
  const updated = await repository.updateSupplier(id, { activo });
  if (!updated) throw new Error("SUPPLIER_NOT_FOUND");
  return updated;
}
