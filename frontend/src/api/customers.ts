import { apiRequest } from "./client";
import type { Customer, CustomerFormState } from "../types";

function normalize(payload: CustomerFormState) {
  return {
    nombre: payload.nombre,
    nitCi: payload.nitCi?.trim() || null,
    telefono: payload.telefono?.trim() || null,
    email: payload.email?.trim() || null,
    direccion: payload.direccion?.trim() || null,
    activo: payload.activo,
  };
}

export const customersApi = {
  list: (search = "") => apiRequest<Customer[]>(`/customers?search=${encodeURIComponent(search)}`),
  get: (id: number) => apiRequest<Customer>(`/customers/${id}`),
  create: (payload: CustomerFormState) =>
    apiRequest<Customer>("/customers", { method: "POST", body: JSON.stringify(normalize(payload)) }),
  update: (id: number, payload: CustomerFormState) =>
    apiRequest<Customer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(normalize(payload)) }),
  patchStatus: (id: number, activo: boolean) =>
    apiRequest<Customer>(`/customers/${id}/status`, { method: "PATCH", body: JSON.stringify({ activo }) }),
};
