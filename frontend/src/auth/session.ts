const STORAGE_KEY = "bioabono.auth";

export type AuthUser = {
  id: number;
  nombre: string;
  username: string;
  rol: "ADMIN" | "EMPLEADO";
  estado: "PENDIENTE" | "ACTIVO" | "INACTIVO";
  activo: boolean;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
