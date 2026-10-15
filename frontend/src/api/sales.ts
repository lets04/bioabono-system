import { apiRequest } from "./client";
import type { Sale, SaleDetail, SaleCreatePayload, SaleMovements } from "../types";

export const salesApi = {
  list: (search = "") => apiRequest<Sale[]>(`/sales?search=${encodeURIComponent(search)}`),
  movements: (filters: { from: string; to: string; usuarioId?: string }) => {
    const params = new URLSearchParams({ from: filters.from, to: filters.to });
    if (filters.usuarioId) params.set("usuarioId", filters.usuarioId);
    return apiRequest<SaleMovements>(`/sales/movements?${params.toString()}`);
  },
  get: (id: number) => apiRequest<SaleDetail>(`/sales/${id}`),
  create: (payload: SaleCreatePayload) =>
    apiRequest<SaleDetail>("/sales", { method: "POST", body: JSON.stringify(payload) }),
};
