import { Elysia } from "elysia";
import { authenticateHeader } from "./service.js";
import type { AuthUser } from "./types.js";

export const requireAuth = new Elysia({ name: "require-auth" }).derive({ as: "scoped" }, async ({ headers }) => {
  const authUser = await authenticateHeader(headers.authorization);
  return { authUser };
});

export const requireAdmin = new Elysia({ name: "require-admin" }).onBeforeHandle(
  { as: "scoped" },
  async ({ headers }) => {
    const user = await authenticateHeader(headers.authorization);
    if (user.rol !== "ADMIN") throw new Error("FORBIDDEN");
  },
);

export function actorId(authUser: AuthUser | undefined) {
  if (!authUser) throw new Error("UNAUTHORIZED");
  return authUser.id;
}
