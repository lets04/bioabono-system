import { Elysia } from "elysia";
import { requireAuth } from "../auth/plugin.js";

export const auditModule = new Elysia({ prefix: "/audit" })
  .use(requireAuth)
  .get("/", () => ({ message: "Audit module pending implementation" }));
