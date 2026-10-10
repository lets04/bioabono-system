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
  return repository.createCustomer(customerCreateSchema.parse(body));
}

export async function updateCustomer(id: number, body: unknown) {
  await getCustomer(id);
  const input = customerUpdateSchema.parse(body);
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
