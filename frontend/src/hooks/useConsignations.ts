import { useQuery } from "@tanstack/react-query";
import { consignationsApi } from "../api/consignations";

export function useConsignations(search = "", estado = "") {
  return useQuery({
    queryKey: ["consignations", search, estado],
    queryFn: () => consignationsApi.list(search, estado),
  });
}