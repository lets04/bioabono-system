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
  if (error instanceof Error && error.message === "SUPPLIER_NOT_FOUND") {
    set.status = 404;
    return { error: "SUPPLIER_NOT_FOUND", message: "El proveedor no existe" };
  }
  if (error instanceof Error && error.message === "INVALID_ID") {
    set.status = 400;
    return { error: "INVALID_ID", message: "Identificador inválido" };
  }
  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
}

export const suppliersModule = new Elysia({ prefix: "/suppliers" })
  .get("/", ({ query }) => service.listSuppliers(query.search as string | undefined))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getSupplier(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set }) => {
    try {
      set.status = 201;
      return await service.createSupplier(body);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      return await service.updateSupplier(parseId(params.id), body);
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
      return await service.setSupplierStatus(parseId(params.id), payload.activo);
    } catch (error) {
      return handleError(error, set);
    }
  });
