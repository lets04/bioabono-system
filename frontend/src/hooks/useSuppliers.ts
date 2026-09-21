import { useQuery } from "@tanstack/react-query";
import { suppliersApi } from "../api/suppliers";

export function useSuppliers(search = "") {
  return useQuery({
    queryKey: ["suppliers", search],
    queryFn: () => suppliersApi.list(search),
  });
}
