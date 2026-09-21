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
    if (error.message === "PRODUCT_NOT_FOUND" || error.message === "PRESENTATION_NOT_FOUND") {
      set.status = 404;
      return { error: error.message, message: "Recurso no encontrado" };
    }
    if (error.message === "PRODUCT_ABREVIACION_EXISTS") {
      set.status = 409;
      return { error: error.message, message: "Ya existe un producto con esa abreviación" };
    }
    if (error.message.startsWith("PRESENTATION_CODE_EXISTS")) {
      set.status = 409;
      return { error: "PRESENTATION_CODE_EXISTS", message: `Ya existe una presentación con código ${error.message.split(":")[1]}` };
    }
    if (error.message.startsWith("PRESENTATION_CODE_DUPLICATE_IN_REQUEST")) {
      set.status = 409;
      return { error: "PRESENTATION_CODE_DUPLICATE", message: `Código duplicado en la solicitud: ${error.message.split(":")[1]}` };
    }
    if (error.message === "PRODUCT_CODE_EXISTS") {
      set.status = 409;
      return { error: error.message, message: "Ya existe un producto con ese código" };
    }
    if (error.message === "INVALID_ID") {
      set.status = 400;
      return { error: error.message, message: "Identificador inválido" };
    }
  }
  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
}

export const productsModule = new Elysia({ prefix: "/products" })
  .get("/", ({ query }) => {
    const includeInactive = query.includeInactive === "false" ? false : true;
    return service.listProducts(query.search as string | undefined, includeInactive);
  })
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getProduct(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set }) => {
    try {
      set.status = 201;
      return await service.createProduct(body);
    } catch (error) {
      return handleError(error, set);
    }
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      return await service.updateProduct(parseId(params.id), body);
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
      return await service.setProductStatus(parseId(params.id), payload.activo);
    } catch (error) {
      return handleError(error, set);
    }
  });
