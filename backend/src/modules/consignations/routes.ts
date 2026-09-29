import { Elysia } from "elysia";
import { ZodError } from "zod";
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
    if (msg === "NO_SYSTEM_USER") {
      set.status = 500;
      return { error: msg, message: "No hay usuario del sistema" };
    }
  }
  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
}

export const consignationsModule = new Elysia({ prefix: "/consignations" })
  .get("/", ({ query }) => service.listConsignations(query))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getConsignation(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set }) => {
    try {
      set.status = 201;
      return await service.createConsignation(body);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/:id/liquidate", async ({ params, body, set }) => {
    try {
      return await service.liquidateConsignation(parseId(params.id), body);
    } catch (error) {
      return handleError(error, set);
    }
  });