import { Elysia } from "elysia";

export const consignationsModule = new Elysia({ prefix: "/consignations" })
  .get("/", () => ({ message: "Consignations module pending implementation" }))
  .post("/:id/liquidate", () => ({ message: "Consignment liquidation pending implementation" }));
