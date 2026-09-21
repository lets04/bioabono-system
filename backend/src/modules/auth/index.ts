import { Elysia } from "elysia";

export const authModule = new Elysia({ prefix: "/auth" })
  .post("/login", () => ({ message: "Auth module pending implementation" }))
  .post("/logout", () => ({ message: "Auth module pending implementation" }));
