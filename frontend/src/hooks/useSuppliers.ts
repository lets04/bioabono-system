import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { suppliersApi } from "../api/suppliers";

export function useSuppliers(search = "") {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["suppliers", term],
    queryFn: () => suppliersApi.list(term),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}
