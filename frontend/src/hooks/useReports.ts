import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports";
import type { ReportFilters } from "../types";

export function usePurchasesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "purchases", filters],
    queryFn: () => reportsApi.purchases(filters),
  });
}

export function useSalesReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "sales", filters],
    queryFn: () => reportsApi.sales(filters),
  });
}

export function useInventoryReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "inventory", filters],
    queryFn: () => reportsApi.inventory(filters),
  });
}

export function useProductsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "products", filters],
    queryFn: () => reportsApi.products(filters),
  });
}

export function useConsignationsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "consignations", filters],
    queryFn: () => reportsApi.consignations(filters),
  });
}
