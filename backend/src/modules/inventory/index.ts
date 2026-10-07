import { Elysia } from "elysia";
import { requireAuth } from "../auth/plugin.js";

export const inventoryModule = new Elysia()
  .use(requireAuth)
  .get("/inventory", () => ({ message: "Inventory module pending implementation" }))
  .get("/kardex", () => ({ message: "Kardex module pending implementation" }));
