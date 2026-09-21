import { Elysia } from "elysia";

export const auditModule = new Elysia({ prefix: "/audit" })
  .get("/", () => ({ message: "Audit module pending implementation" }));
