import { apiRequest } from "./client";
import type { Category, CategoryFormState } from "../types";

export const categoriesApi = {
  list: () => apiRequest<Category[]>("/categories"),
  create: (payload: CategoryFormState) =>
    apiRequest<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: CategoryFormState) =>
    apiRequest<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  patchStatus: (id: number, activo: boolean) =>
    apiRequest<Category>(`/categories/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    }),
};
