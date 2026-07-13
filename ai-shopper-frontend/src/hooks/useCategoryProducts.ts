import { useQuery } from "@tanstack/react-query";
import { getProductsByCategory } from "../services/category.service";

export const useCategoryProducts = (slug: string) => {
  return useQuery({
    queryKey: ["category-products", slug],
    queryFn: () => getProductsByCategory(slug),
    enabled: !!slug,
  });
};
