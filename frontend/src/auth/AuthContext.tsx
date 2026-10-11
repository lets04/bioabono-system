import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, type SessionResponse } from "../api/auth";
import { ApiError } from "../api/client";
import { cacheUser, clearCachedUser, getCachedUser, type AuthUser } from "./session";

/** Estado de la sesión según el servidor: vencida, o vigente con su vencimiento (null si es persistente). */
export type SessionCheck = { expired: true } | { expired: false; deadline: number | null };

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  /** Momento (reloj local) en que vence una sesión normal; null si es "Mantener sesión iniciada". */
  sessionDeadline: number | null;
  /** `beforeEnter` corre con las credenciales ya aceptadas y antes de mostrar la app (p. ej. una animación). */
  login: (username: string, password: string, remember: boolean, beforeEnter?: () => Promise<void>) => Promise<void>;
  logout: () => Promise<void>;
  /** Vuelve a consultar el vencimiento (otra pestaña pudo haber alargado la sesión). */
  refreshSession: () => Promise<SessionCheck>;
  extendSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Diferencias menores (latencia de la petición) no cambian el vencimiento guardado, así no se reprograman avisos.
const DEADLINE_TOLERANCE_MS = 10_000;

function deadlineOf(session: SessionResponse) {
  // El servidor da el tiempo restante, no la hora, para no depender de que el reloj del equipo esté en hora.
  return session.persistent ? null : Date.now() + session.expiresInMs;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [sessionDeadline, setSessionDeadline] = useState<number | null>(null);

  const applySession = useCallback((session: SessionResponse) => {
    cacheUser(session.user);
    setUser(session.user);
    const next = deadlineOf(session);
    setSessionDeadline((current) =>
      current !== null && next !== null && Math.abs(current - next) < DEADLINE_TOLERANCE_MS ? current : next,
    );
    return next;
  }, []);

  useEffect(() => {
    // La cookie de sesión no es legible desde aquí: el servidor confirma si sigue vigente.
    const cached = getCachedUser();
    authApi
      .me()
      .then(applySession)
      .catch((error) => {
        // Solo un rechazo explícito invalida la sesión; un fallo de red conserva el usuario guardado.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearCachedUser();
          setUser(null);
        } else {
          setUser(cached);
        }
      })
      .finally(() => setIsReady(true));
  }, [applySession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      sessionDeadline,
      login: async (username, password, remember, beforeEnter) => {
        const session = await authApi.login(username, password, remember);
        await beforeEnter?.();
        applySession(session);
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // La sesión local se limpia igual.
        }
        clearCachedUser();
        setUser(null);
        window.location.assign("/");
      },
      refreshSession: async () => {
        try {
          return { expired: false, deadline: applySession(await authApi.me()) };
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return { expired: true };
          // Sin red no se sabe: se mantiene el vencimiento conocido.
          return { expired: false, deadline: sessionDeadline };
        }
      },
      extendSession: async () => {
        applySession(await authApi.extend());
      },
    }),
    [user, isReady, sessionDeadline, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
