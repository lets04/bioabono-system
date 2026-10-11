// El token de sesión vive en una cookie httpOnly que el JavaScript no puede leer.
// Aquí solo se guarda el usuario (sin datos sensibles) para no perder la sesión si falla la red al recargar.
const STORAGE_KEY = "bioabono.user";
const LEGACY_KEY = "bioabono.auth";

export type AuthUser = {
  id: number;
  nombre: string;
  username: string;
  rol: "ADMIN" | "EMPLEADO";
  estado: "PENDIENTE" | "ACTIVO" | "INACTIVO";
  activo: boolean;
};

export function getCachedUser(): AuthUser | null {
  // Versiones anteriores guardaban el token aquí.
  localStorage.removeItem(LEGACY_KEY);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function cacheUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearCachedUser() {
  localStorage.removeItem(STORAGE_KEY);
}
