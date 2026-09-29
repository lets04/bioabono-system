import { apiRequest } from "./client";
import type {
  Consignation,
  ConsignationDetail,
  ConsignationCreatePayload,
  ConsignationLiquidatePayload,
} from "../types";

export const consignationsApi = {
  list: (search = "", estado = "") =>
    apiRequest<Consignation[]>(
      `/consignations?search=${encodeURIComponent(search)}${estado ? `&estado=${encodeURIComponent(estado)}` : ""}`,
    ),
  get: (id: number) => apiRequest<ConsignationDetail>(`/consignations/${id}`),
  create: (payload: ConsignationCreatePayload) =>
    apiRequest<ConsignationDetail>("/consignations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  liquidate: (id: number, payload: ConsignationLiquidatePayload) =>
    apiRequest<ConsignationDetail>(`/consignations/${id}/liquidate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};