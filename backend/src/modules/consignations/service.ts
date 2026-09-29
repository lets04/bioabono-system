import * as repository from "./repository.js";
import { consignationCreateSchema, consignationLiquidateSchema, consignationListSchema } from "./schema.js";
import { db } from "../../db/index.js";
import { customers } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

export async function listConsignations(query: unknown) {
  const filters = consignationListSchema.parse(query);
  return repository.listConsignations(filters);
}

export async function getConsignation(id: number) {
  const consignation = await repository.getConsignationById(id);
  if (!consignation) throw new Error("CONSIGNATION_NOT_FOUND");
  return consignation;
}

export async function createConsignation(body: unknown) {
  const input = consignationCreateSchema.parse(body);

  const [cliente] = await db.select().from(customers).where(eq(customers.id, input.clienteId)).limit(1);
  if (!cliente) throw new Error("CUSTOMER_NOT_FOUND");
  if (!cliente.activo) throw new Error("CUSTOMER_INACTIVE");

  const usuarioId = await repository.getSystemUserId();
  const result = await repository.createConsignationWithTransaction(input, usuarioId);

  return getConsignation(result.id);
}

export async function liquidateConsignation(id: number, body: unknown) {
  const input = consignationLiquidateSchema.parse(body);
  const usuarioId = await repository.getSystemUserId();
  await repository.liquidateConsignationWithTransaction(id, input, usuarioId);

  return getConsignation(id);
}