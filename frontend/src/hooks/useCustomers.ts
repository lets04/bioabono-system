import { useQuery } from "@tanstack/react-query";
import { customersApi } from "../api/customers";

export function useCustomers(search = "") {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => customersApi.list(search),
  });
}
