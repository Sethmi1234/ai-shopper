import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";

export const useProducts = (limit = 4) => {
  return useQuery({
    queryKey: ["products", limit],
    queryFn: () => getProducts(limit),
  });
};