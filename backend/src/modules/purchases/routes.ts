import { Elysia } from "elysia";
import { ZodError } from "zod";
import { fallbackError, parseId, validationError } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) return validationError(error, set);
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
  return fallbackError(error, set);
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
