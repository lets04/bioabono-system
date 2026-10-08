import { Elysia } from "elysia";
import { ZodError } from "zod";
import * as service from "./service.js";
import { publicUser } from "./types.js";
import { requireAuth } from "./plugin.js";
import { checkRateLimit, clientIp } from "../../lib/rateLimit.js";

const MINUTE = 60_000;

function usernameFrom(body: unknown) {
  const value = (body as { username?: unknown } | null)?.username;
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function handleAuthError(error: unknown, set: { status?: number | string }) {
  if (error instanceof ZodError) {
    set.status = 400;
    const first = error.issues[0]?.message ?? "Datos inválidos";
    return { error: "VALIDATION_ERROR", message: first, details: error.flatten() };
  }

  if (!(error instanceof Error)) {
    set.status = 500;
    return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
  }

  const messages: Record<string, { status: number; message: string }> = {
    INVALID_CREDENTIALS: { status: 401, message: "Usuario o contraseña incorrectos" },
    ACCOUNT_PENDING: { status: 403, message: "Primero debes activar tu cuenta" },
    ACCOUNT_INACTIVE: { status: 403, message: "Tu cuenta está inactiva" },
    UNAUTHORIZED: { status: 401, message: "No autenticado" },
    FORBIDDEN: { status: 403, message: "No tienes permiso para realizar esta acción" },
    USERNAME_EXISTS: { status: 409, message: "Ya existe un usuario con ese correo" },
    USER_NOT_FOUND: { status: 404, message: "El usuario no existe" },
    USER_NOT_PENDING: { status: 409, message: "El usuario no está pendiente de activación" },
    USER_STILL_PENDING: { status: 409, message: "El usuario todavía está pendiente de activación" },
    USER_NOT_ACTIVATED: { status: 409, message: "El usuario todavía no activó su cuenta" },
    CANNOT_CHANGE_OWN_STATUS: { status: 409, message: "No puedes cambiar el estado de tu propia cuenta" },
    INVALID_ACTIVATION_TOKEN: { status: 400, message: "El enlace de activación no es válido" },
    ACTIVATION_TOKEN_USED: { status: 409, message: "El enlace de activación ya fue utilizado" },
    ACTIVATION_TOKEN_EXPIRED: { status: 410, message: "El enlace de activación expiró" },
    INVALID_RESET_TOKEN: { status: 400, message: "El enlace de recuperación no es válido" },
    RESET_TOKEN_USED: { status: 409, message: "El enlace de recuperación ya fue utilizado" },
    RESET_TOKEN_EXPIRED: { status: 410, message: "El enlace de recuperación expiró" },
    INVALID_ID: { status: 400, message: "Identificador inválido" },
    RATE_LIMITED: { status: 429, message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo" },
  };

  const mapped = messages[error.message];
  if (mapped) {
    set.status = mapped.status;
    return { error: error.message, message: mapped.message };
  }

  set.status = 500;
  return { error: "INTERNAL_ERROR", message: "No se pudo procesar la solicitud" };
}

const publicAuth = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body, headers, set }) => {
    try {
      checkRateLimit(`login:ip:${clientIp(headers)}`, 30, 15 * MINUTE);
      checkRateLimit(`login:user:${usernameFrom(body)}`, 10, 15 * MINUTE);
      return await service.login(body);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .post("/logout", () => ({ message: "Sesión cerrada" }))
  .post("/forgot-password", async ({ body, headers, set }) => {
    try {
      checkRateLimit(`forgot:ip:${clientIp(headers)}`, 10, 15 * MINUTE);
      checkRateLimit(`forgot:user:${usernameFrom(body)}`, 3, 15 * MINUTE);
      return await service.forgotPassword(body);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .post("/reset-password", async ({ body, headers, set }) => {
    try {
      checkRateLimit(`reset:ip:${clientIp(headers)}`, 10, 15 * MINUTE);
      return await service.resetPassword(body);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .get("/activate", async ({ query, headers, set }) => {
    try {
      checkRateLimit(`activate:ip:${clientIp(headers)}`, 30, 15 * MINUTE);
      const token = typeof query.token === "string" ? query.token : "";
      if (!token) throw new Error("INVALID_ACTIVATION_TOKEN");
      return await service.getActivationStatus(token);
    } catch (error) {
      return handleAuthError(error, set);
    }
  })
  .post("/activate", async ({ body, headers, set }) => {
    try {
      checkRateLimit(`activate:ip:${clientIp(headers)}`, 30, 15 * MINUTE);
      return await service.activateAccount(body);
    } catch (error) {
      return handleAuthError(error, set);
    }
  });

const privateAuth = new Elysia({ prefix: "/auth" })
  .use(requireAuth)
  .get("/me", ({ authUser }) => publicUser(authUser));

export const authModule = new Elysia().use(publicAuth).use(privateAuth);
