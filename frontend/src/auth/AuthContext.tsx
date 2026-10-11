import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { ApiError } from "../api/client";
import { clearSession, getSession, saveSession, type AuthUser } from "./session";

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      setIsReady(true);
      return;
    }

    authApi
      .me()
      .then((current) => {
        saveSession({ token: session.token, user: current });
        setUser(current);
      })
      .catch((error) => {
        // Solo un rechazo explícito invalida la sesión; un fallo de red conserva la sesión guardada.
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
          setUser(null);
        } else {
          setUser(session.user);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login: async (username, password) => {
        const result = await authApi.login(username, password);
        saveSession(result);
        setUser(result.user);
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // La sesión local se limpia igual.
        }
        clearSession();
        setUser(null);
        window.location.assign("/");
      },
    }),
    [user, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
