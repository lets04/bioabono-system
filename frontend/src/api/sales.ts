import { apiRequest } from "./client";
import type { Sale, SaleDetail, SaleCreatePayload } from "../types";

export const salesApi = {
  list: (search = "") => apiRequest<Sale[]>(`/sales?search=${encodeURIComponent(search)}`),
  get: (id: number) => apiRequest<SaleDetail>(`/sales/${id}`),
  create: (payload: SaleCreatePayload) =>
    apiRequest<SaleDetail>("/sales", { method: "POST", body: JSON.stringify(payload) }),
};
