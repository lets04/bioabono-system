import { clearSession, getToken } from "../auth/session";

const AUTH_PUBLIC_PATHS = [
  "/auth/login",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/activate",
];

function isPublicAuthPath(path: string) {
  return AUTH_PUBLIC_PATHS.some((item) => path === item || path.startsWith(`${item}?`));
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Evita disparar varias redirecciones cuando fallan varias peticiones a la vez.
let redirectingToLogin = false;

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !isPublicAuthPath(path)) {
      clearSession();
      if (!redirectingToLogin && (window.location.pathname === "/" || !isPublicFrontendPath())) {
        redirectingToLogin = true;
        window.location.assign("/");
      }
    }
    throw new ApiError(data?.message || "No se pudo completar la operación", response.status);
  }

  return data as T;
}

function isPublicFrontendPath() {
  return ["/activar-cuenta", "/recuperar-contrasena", "/olvide-contrasena"].includes(window.location.pathname);
}
