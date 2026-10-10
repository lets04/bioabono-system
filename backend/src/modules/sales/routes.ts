import { Elysia } from "elysia";
import { COMMON_ERRORS, mapDomainError, parseId, PRESENTATION_ERRORS, type SetLike } from "../../lib/http.js";
import { requireAuth } from "../auth/plugin.js";
import * as service from "./service.js";

const ERRORS = {
  ...COMMON_ERRORS,
  ...PRESENTATION_ERRORS,
  SALE_NOT_FOUND: { status: 404, message: "La venta no existe" },
  CUSTOMER_NOT_FOUND: { status: 404, message: "El cliente no existe" },
  CUSTOMER_INACTIVE: { status: 409, message: "El cliente está inactivo" },
};

const handleError = (error: unknown, set: SetLike) => mapDomainError(error, set, ERRORS);

export const salesModule = new Elysia({ prefix: "/sales" })
  .use(requireAuth)
  .get("/", ({ query }) => service.listSales(query.search as string | undefined))
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getSale(parseId(params.id));
    } catch (error) {
      return handleError(error, set);
    }
  })
  .post("/", async ({ body, set, authUser }) => {
    try {
      set.status = 201;
      return await service.createSale(body, authUser.id);
    } catch (error) {
      return handleError(error, set);
    }
  });
