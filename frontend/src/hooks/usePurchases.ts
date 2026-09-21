import { useQuery } from "@tanstack/react-query";
import { purchasesApi } from "../api/purchases";

export function usePurchases(search = "") {
  return useQuery({
    queryKey: ["purchases", search],
    queryFn: () => purchasesApi.list(search),
  });
}

export function usePurchase(id: number | null) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: () => purchasesApi.get(id!),
    enabled: id !== null,
  });
}
