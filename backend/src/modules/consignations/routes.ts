import { Elysia } from "elysia";
import { ZodError } from "zod";
import { fallbackError, parseId, validationError } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) return validationError(error, set);
  if (error instanceof Error) {
    const msg = error.message;
    if (msg === "CONSIGNATION_NOT_FOUND") {
      set.status = 404;
      return { error: msg, message: "La consignación no existe" };
    }
    if (msg === "CUSTOMER_NOT_FOUND") {
      set.status = 404;
      return { error: msg, message: "El cliente no existe" };
    }
    if (msg === "CUSTOMER_INACTIVE") {
      set.status = 409;
      return { error: msg, message: "El cliente está inactivo" };
    }
    if (msg === "ALREADY_LIQUIDATED") {
      set.status = 409;
      return { error: msg, message: "La consignación ya fue liquidada" };
    }
    if (msg === "INVALID_LIQUIDATION") {
      set.status = 400;
      return { error: msg, message: "Cantidades inválidas: entregado debe ser igual a vendido + devuelto" };
    }
    if (msg.startsWith("PRESENTATION_NOT_FOUND")) {
      set.status = 404;
      return { error: "PRESENTATION_NOT_FOUND", message: `Presentación no encontrada: ${msg.split(":")[1]}` };
    }
    if (msg.startsWith("PRESENTATION_INACTIVE")) {
      set.status = 409;
      return { error: "PRESENTATION_INACTIVE", message: `Presentación inactiva: ${msg.split(":")[1]}` };
    }
    if (msg.startsWith("STOCK_INSUFFICIENT")) {
      set.status = 409;
      return { error: "STOCK_INSUFFICIENT", message: `Stock insuficiente para presentación ${msg.split(":")[1]}` };
    }
    if (msg === "INVALID_ID" || msg === "INVALID_DATE") {
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

export const consignationsModule = new Elysia({ prefix: "/consignations" })
  .use(requireAuth)
  .get("/", ({ query }) => service.listConsignations(query))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getConsignation(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set, authUser }) => {
    try {
      set.status = 201;
      return await service.createConsignation(body, authUser.id);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/:id/liquidate", async ({ params, body, set, authUser }) => {
    try {
      return await service.liquidateConsignation(parseId(params.id), body, authUser.id);
    } catch (error) {
      return handleError(error, set);
    }
  });