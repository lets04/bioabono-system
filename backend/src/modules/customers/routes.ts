import { Elysia } from "elysia";
import { ZodError } from "zod";
import { fallbackError, parseId, validationError } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

function handleError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) return validationError(error, set);
  if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
    set.status = 404;
    return { error: "CUSTOMER_NOT_FOUND", message: "El cliente no existe" };
  }
  if (error instanceof Error && error.message === "INVALID_ID") {
    set.status = 400;
    return { error: "INVALID_ID", message: "Identificador inválido" };
  }
  return fallbackError(error, set);
}

export const customersModule = new Elysia({ prefix: "/customers" })
  .use(requireAuth)
  .get("/", ({ query }) => service.listCustomers(query.search as string | undefined))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getCustomer(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set }) => {
    try {
      set.status = 201;
      return await service.createCustomer(body);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      return await service.updateCustomer(parseId(params.id), body);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .patch("/:id/status", async ({ params, body, set }) => {
    try {
      const payload = body as { activo?: unknown };
      if (typeof payload.activo !== "boolean") {
        set.status = 400;
        return { error: "VALIDATION_ERROR", message: "activo debe ser booleano" };
      }
      return await service.setCustomerStatus(parseId(params.id), payload.activo);
    } catch (error) {
      return handleError(error, set);
    }
  });
