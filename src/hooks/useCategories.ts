import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/product.service";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};
