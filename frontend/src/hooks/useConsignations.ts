import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "./useDebouncedValue";
import { consignationsApi } from "../api/consignations";

export function useConsignations(search = "", estado = "") {
  const term = useDebouncedValue(search.trim());
  return useQuery({
    queryKey: ["consignations", term, estado],
    queryFn: () => consignationsApi.list(term, estado),
    // Mantiene la tabla visible mientras llega el resultado de la nueva búsqueda.
    placeholderData: keepPreviousData,
  });
}