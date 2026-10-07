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
      if (window.location.pathname === "/" || !isPublicFrontendPath()) {
        window.location.assign("/");
      }
    }
    throw new Error(data?.message || "No se pudo completar la operación");
  }

  return data as T;
}

function isPublicFrontendPath() {
  return ["/activar-cuenta", "/recuperar-contrasena", "/olvide-contrasena"].includes(window.location.pathname);
}
