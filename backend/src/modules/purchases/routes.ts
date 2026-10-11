import { Elysia } from "elysia";
import { COMMON_ERRORS, mapDomainError, parseId, PRESENTATION_ERRORS, type SetLike } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

const ERRORS = {
  ...COMMON_ERRORS,
  PRESENTATION_NOT_FOUND: PRESENTATION_ERRORS.PRESENTATION_NOT_FOUND,
  PRESENTATION_INACTIVE: PRESENTATION_ERRORS.PRESENTATION_INACTIVE,
  INVALID_PRICE: { status: 400, message: "Datos inválidos" },
  PURCHASE_NOT_FOUND: { status: 404, message: "La compra no existe" },
  SUPPLIER_NOT_FOUND: { status: 404, message: "El proveedor no existe" },
  SUPPLIER_INACTIVE: { status: 409, message: "El proveedor está inactivo" },
};

const handleError = (error: unknown, set: SetLike) => mapDomainError(error, set, ERRORS);

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
