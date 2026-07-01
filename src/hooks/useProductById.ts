import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/services/product.service";

export const useProductById = (id: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};
