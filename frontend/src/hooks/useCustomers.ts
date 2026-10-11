import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { customersApi } from "../api/customers";

export function useCustomers(search = "") {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["customers", term],
    queryFn: () => customersApi.list(term),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}
