import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";

export const useProducts = (limit?: number) => {
  return useQuery({
    queryKey: limit ? ["products", limit] : ["products"],
    queryFn: () => getProducts(limit),
  });
};