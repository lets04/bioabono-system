import { apiRequest } from "./client";
import type { Product, ProductFormState } from "../types";
import { normalizeProductPayload } from "../utils/product";

export const productsApi = {
  list: (search = "") => apiRequest<Product[]>(`/products?search=${encodeURIComponent(search)}`),
  get: (id: number) => apiRequest<Product>(`/products/${id}`),
  create: (payload: ProductFormState) =>
    apiRequest<Product>("/products", {
      method: "POST",
      body: JSON.stringify(normalizeProductPayload(payload)),
    }),
  update: (id: number, payload: ProductFormState) =>
    apiRequest<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(normalizeProductPayload(payload)),
    }),
  patchStatus: (id: number, activo: boolean) =>
    apiRequest<Product>(`/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    }),
};
