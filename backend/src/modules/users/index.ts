import { Elysia } from "elysia";
import { handleAuthError } from "../auth/index.js";
import { requireAdmin, requireAuth } from "../auth/plugin.js";
import * as service from "../auth/service.js";
import type { AuthUser } from "../auth/types.js";

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error("INVALID_ID");
  return id;
}

export const usersModule = new Elysia({ prefix: "/users" })
  .use(requireAuth)
  .use(requireAdmin)
  .get("/", async ({ set }) => {
    try {
      return await service.listUsers();
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .post("/", async ({ body, set, authUser }) => {
    try {
      set.status = 201;
      return await service.inviteUser(body, authUser as AuthUser);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .get("/:id", async ({ params, set }) => {
    try {
      return await service.getUser(parseId(params.id));
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .post("/:id/resend-invitation", async ({ params, set, authUser }) => {
    try {
      return await service.resendInvitation(parseId(params.id), authUser as AuthUser);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .patch("/:id/status", async ({ params, body, set, authUser }) => {
    try {
      return await service.updateUserStatus(parseId(params.id), body, authUser as AuthUser);
    } catch (error) {
      return handleAuthError(error, set);
    }
  });
