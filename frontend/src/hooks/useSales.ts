import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { salesApi } from "../api/sales";

export function useSales(search = "") {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["sales", term],
    queryFn: () => salesApi.list(term),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}
