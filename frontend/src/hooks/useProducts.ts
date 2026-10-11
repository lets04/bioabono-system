import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { productsApi } from "../api/products";

export function useProducts(search: string) {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["products", term],
    queryFn: () => productsApi.list(term),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}
