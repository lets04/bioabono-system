import * as repository from "./repository.js";
import { customerCreateSchema, customerUpdateSchema } from "./schema.js";

export async function listCustomers(search?: string) {
  return repository.listCustomers(search);
}

export async function getCustomer(id: number) {
  const customer = await repository.getCustomerById(id);
  if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
  return customer;
}

export async function createCustomer(body: unknown) {
  const input = customerCreateSchema.parse(body);
  if (input.email === "") (input as any).email = null;
  return repository.createCustomer(input);
}

export async function updateCustomer(id: number, body: unknown) {
  await getCustomer(id);
  const input = customerUpdateSchema.parse(body);
  if ((input as any).email === "") (input as any).email = null;
  const updated = await repository.updateCustomer(id, input);
  if (!updated) throw new Error("CUSTOMER_NOT_FOUND");
  return updated;
}

export async function setCustomerStatus(id: number, activo: boolean) {
  await getCustomer(id);
  const updated = await repository.updateCustomer(id, { activo });
  if (!updated) throw new Error("CUSTOMER_NOT_FOUND");
  return updated;
}
