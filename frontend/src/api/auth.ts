import { apiRequest } from "./client";
import type { AuthUser } from "../auth/session";

// `persistent`: sesión iniciada con "Mantener sesión iniciada". `expiresInMs`: tiempo que le queda.
export type SessionResponse = {
  user: AuthUser;
  persistent: boolean;
  expiresInMs: number;
};

export const authApi = {
  login: (username: string, password: string, remember: boolean) =>
    apiRequest<SessionResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, remember }),
    }),
  logout: () => apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<SessionResponse>("/auth/me"),
  extend: () => apiRequest<SessionResponse>("/auth/extend", { method: "POST" }),
  activateStatus: (token: string) => apiRequest<{ username: string; nombre: string }>(`/auth/activate?token=${encodeURIComponent(token)}`),
  activate: (payload: { token: string; password: string; confirmPassword: string }) =>
    apiRequest<{ user: AuthUser }>("/auth/activate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  forgotPassword: (username: string) =>
    apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),
  resetPassword: (payload: { token: string; password: string; confirmPassword: string }) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
