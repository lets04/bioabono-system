import { Elysia } from "elysia";

export const inventoryModule = new Elysia()
  .get("/inventory", () => ({ message: "Inventory module pending implementation" }))
  .get("/kardex", () => ({ message: "Kardex module pending implementation" }));
