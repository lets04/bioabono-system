import { useQuery } from "@tanstack/react-query";
import { salesApi } from "../api/sales";

export function useSales(search = "") {
  return useQuery({
    queryKey: ["sales", search],
    queryFn: () => salesApi.list(search),
  });
}
