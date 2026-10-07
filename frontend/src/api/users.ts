import { apiRequest } from "./client";
import type { SystemUser, UserInvitePayload } from "../types";

export const usersApi = {
  list: () => apiRequest<SystemUser[]>("/users"),
  get: (id: number) => apiRequest<SystemUser>(`/users/${id}`),
  invite: (payload: UserInvitePayload) =>
    apiRequest<{ user: SystemUser; emailEnviado: boolean }>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resendInvitation: (id: number) =>
    apiRequest<{ emailEnviado: boolean }>(`/users/${id}/resend-invitation`, { method: "POST" }),
  patchStatus: (id: number, estado: "ACTIVO" | "INACTIVO") =>
    apiRequest<SystemUser>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),
};
