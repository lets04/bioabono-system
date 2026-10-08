import { ApiError, apiRequest, authHeaders, handleUnauthorized } from "./client";
import { todayLocal } from "../utils/format";
import type { PurchasesReport, SalesReport, InventoryReport, ProductsReport, ConsignationsReport, ReportFilters } from "../types";

function toQuery(filters: ReportFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function downloadExport(path: string, fallbackName: string) {
  const res = await fetch(`/api${path}`, { method: "GET", headers: { ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.message || "No se pudo generar el archivo Excel", res.status);
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  let filename = fallbackName;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const reportsApi = {
  purchases: (filters: ReportFilters) => apiRequest<PurchasesReport>(`/reports/purchases${toQuery(filters)}`),
  sales: (filters: ReportFilters) => apiRequest<SalesReport>(`/reports/sales${toQuery(filters)}`),
  inventory: (filters: ReportFilters) => apiRequest<InventoryReport>(`/reports/inventory${toQuery(filters)}`),
  products: (filters: ReportFilters) => apiRequest<ProductsReport>(`/reports/products${toQuery(filters)}`),
  consignations: (filters: ReportFilters) => apiRequest<ConsignationsReport>(`/reports/consignations${toQuery(filters)}`),
  exportPurchases: (filters: ReportFilters) => downloadExport(`/reports/purchases/export${toQuery(filters)}`, `reporte-compras-${todayLocal()}.xlsx`),
  exportSales: (filters: ReportFilters) => downloadExport(`/reports/sales/export${toQuery(filters)}`, `reporte-ventas-${todayLocal()}.xlsx`),
  exportInventory: (filters: ReportFilters) => downloadExport(`/reports/inventory/export${toQuery(filters)}`, `reporte-inventario-${todayLocal()}.xlsx`),
  exportProducts: (filters: ReportFilters) => downloadExport(`/reports/products/export${toQuery(filters)}`, `reporte-productos-${todayLocal()}.xlsx`),
};
