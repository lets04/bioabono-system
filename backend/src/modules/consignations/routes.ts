import { Elysia } from "elysia";
import { COMMON_ERRORS, mapDomainError, parseId, PRESENTATION_ERRORS, type SetLike } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

const ERRORS = {
  ...COMMON_ERRORS,
  ...PRESENTATION_ERRORS,
  CONSIGNATION_NOT_FOUND: { status: 404, message: "La consignación no existe" },
  CUSTOMER_NOT_FOUND: { status: 404, message: "El cliente no existe" },
  CUSTOMER_INACTIVE: { status: 409, message: "El cliente está inactivo" },
  ALREADY_LIQUIDATED: { status: 409, message: "La consignación ya fue liquidada" },
  INVALID_LIQUIDATION: { status: 400, message: "Cantidades inválidas: entregado debe ser igual a vendido + devuelto" },
};

const handleError = (error: unknown, set: SetLike) => mapDomainError(error, set, ERRORS);

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