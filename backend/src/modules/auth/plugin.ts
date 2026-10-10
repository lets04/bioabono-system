import { Elysia } from "elysia";
import { authenticateHeader } from "./service.js";

export const requireAuth = new Elysia({ name: "require-auth" }).derive({ as: "scoped" }, async ({ headers }) => {
  const authUser = await authenticateHeader(headers.authorization);
  return { authUser };
});

// Reutiliza el usuario ya autenticado por requireAuth en lugar de volver a consultar la base.
export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ authUser }) => {
    if (authUser?.rol !== "ADMIN") throw new Error("FORBIDDEN");
  });
