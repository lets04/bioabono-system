import { apiRequest } from "./client";
import type { Supplier, SupplierFormState } from "../types";

function normalize(payload: SupplierFormState) {
  return {
    nombre: payload.nombre,
    nit: payload.nit?.trim() || null,
    telefono: payload.telefono?.trim() || null,
    email: payload.email?.trim() || null,
    direccion: payload.direccion?.trim() || null,
    activo: payload.activo,
  };
}

export const suppliersApi = {
  list: (search = "") => apiRequest<Supplier[]>(`/suppliers?search=${encodeURIComponent(search)}`),
  get: (id: number) => apiRequest<Supplier>(`/suppliers/${id}`),
  create: (payload: SupplierFormState) =>
    apiRequest<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(normalize(payload)),
    }),
  update: (id: number, payload: SupplierFormState) =>
    apiRequest<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(normalize(payload)),
    }),
  patchStatus: (id: number, activo: boolean) =>
    apiRequest<Supplier>(`/suppliers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    }),
};
