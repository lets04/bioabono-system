import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { purchasesApi } from "../api/purchases";

export function usePurchases(search = "") {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["purchases", term],
    queryFn: () => purchasesApi.list(term),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}
