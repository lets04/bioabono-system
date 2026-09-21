import { Elysia } from "elysia";

export const usersModule = new Elysia({ prefix: "/users" })
  .get("/", () => ({ message: "Users module pending implementation" }));
