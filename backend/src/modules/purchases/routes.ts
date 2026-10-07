import { Elysia } from "elysia";
import { ZodError } from "zod";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID");
  return id;
}

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) {
    set.status = 400;
    return { error: "VALIDATION_ERROR", details: error.flatten() };
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (msg === "PURCHASE_NOT_FOUND") {
      set.status = 404;
      return { error: msg, message: "La compra no existe" };
    }
    if (msg === "SUPPLIER_NOT_FOUND") {
      set.status = 404;
      return { error: msg, message: "El proveedor no existe" };
    }
    if (msg === "SUPPLIER_INACTIVE") {
      set.status = 409;
      return { error: msg, message: "El proveedor está inactivo" };
    }
    if (msg.startsWith("PRESENTATION_NOT_FOUND")) {
      set.status = 404;
      return { error: "PRESENTATION_NOT_FOUND", message: `Presentación no encontrada: ${msg.split(":")[1]}` };
    }
    if (msg.startsWith("PRESENTATION_INACTIVE")) {
      set.status = 409;
      return { error: "PRESENTATION_INACTIVE", message: `Presentación inactiva: ${msg.split(":")[1]}` };
    }
    if (msg === "INVALID_ID" || msg === "INVALID_DATE" || msg === "INVALID_PRICE") {
      set.status = 400;
      return { error: msg, message: "Datos inválidos" };
    }
    if (msg === "UNAUTHORIZED") {
      set.status = 401;
      return { error: msg, message: "No autenticado" };
    }
  }
  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
}

export const purchasesModule = new Elysia({ prefix: "/purchases" })
  .use(requireAuth)
  .get("/", ({ query }) => service.listPurchases(query.search as string | undefined))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getPurchase(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set, authUser }) => {
    try {
      set.status = 201;
      return await service.createPurchase(body, authUser.id);
    } catch (error) {
      return handleError(error, set);
    }
  });
