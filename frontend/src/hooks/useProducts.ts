import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products";

export function useProducts(search: string) {
  return useQuery({
    queryKey: ["products", search],
    queryFn: () => productsApi.list(search),
  });
}
