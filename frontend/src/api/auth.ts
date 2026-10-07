import { apiRequest } from "./client";
import type { AuthUser } from "../auth/session";

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),
  me: () => apiRequest<AuthUser>("/auth/me"),
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
