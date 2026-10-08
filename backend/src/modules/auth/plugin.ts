import { Elysia } from "elysia";
import { authenticateHeader } from "./service.js";
import type { AuthUser } from "./types.js";

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

export function actorId(authUser: AuthUser | undefined) {
  if (!authUser) throw new Error("UNAUTHORIZED");
  return authUser.id;
}
