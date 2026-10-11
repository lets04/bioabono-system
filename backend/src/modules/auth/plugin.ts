import { Elysia, type Cookie } from "elysia";
import { env } from "../../config/env.js";
import { authenticateToken } from "./service.js";
import type { AuthUser } from "./types.js";

export const SESSION_COOKIE = "bioabono_session";

/**
 * httpOnly: el JavaScript de la página no puede leer el token; SameSite=Strict bloquea CSRF.
 * Sin `expires` es una cookie de sesión del navegador: se borra al cerrarlo.
 */
export function setSessionCookie(cookie: Cookie<unknown>, token: string, expires?: Date) {
  cookie.set({ value: token, httpOnly: true, sameSite: "strict", secure: env.cookieSecure, path: "/api", expires });
}

export function clearSessionCookie(cookie: Cookie<unknown>) {
  cookie.set({ value: "", httpOnly: true, sameSite: "strict", secure: env.cookieSecure, path: "/api", maxAge: 0 });
}

export const requireAuth = new Elysia({ name: "require-auth" }).derive({ as: "scoped" }, async ({ cookie }) => {
  const token = cookie[SESSION_COOKIE]?.value;
  const { user, session, renewedUntil } = await authenticateToken(typeof token === "string" ? token : null);
  // El navegador descarta la cookie en su fecha de vencimiento: se alarga junto con la sesión.
  if (renewedUntil && typeof token === "string") setSessionCookie(cookie[SESSION_COOKIE], token, renewedUntil);
  return { authUser: user, authSession: session };
});

// Reutiliza el usuario ya autenticado por requireAuth en lugar de volver a consultar la base.
// El módulo que lo use debe aplicar antes `.use(requireAuth)` para tener `authUser`.
export const requireAdmin = new Elysia({ name: "require-admin" })
  .use(requireAuth)
  .onBeforeHandle({ as: "scoped" }, ({ authUser }) => {
    if (authUser?.rol !== "ADMIN") throw new Error("FORBIDDEN");
  });

/** Para restringir rutas puntuales: `.post("/", handler, adminOnly)`. */
export const adminOnly = {
  beforeHandle({ authUser }: { authUser: AuthUser }) {
    if (authUser.rol !== "ADMIN") throw new Error("FORBIDDEN");
  },
};
