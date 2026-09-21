import { apiRequest } from "./client";
import type { Purchase, PurchaseDetail, PurchaseCreatePayload } from "../types";

export const purchasesApi = {
  list: (search = "") => apiRequest<Purchase[]>(`/purchases?search=${encodeURIComponent(search)}`),
  get: (id: number) => apiRequest<PurchaseDetail>(`/purchases/${id}`),
  create: (payload: PurchaseCreatePayload) =>
    apiRequest<PurchaseDetail>("/purchases", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
