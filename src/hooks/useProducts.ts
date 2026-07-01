import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";

type ProductsResponse = {
  products: Array<{ [key: string]: any }>;
  total: number;
};

export const useProducts = (limit: number = 8) => {
  return useInfiniteQuery<ProductsResponse, unknown, InfiniteData<ProductsResponse>, readonly ["products", number], number>({
    queryKey: ["products", limit] as const,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) =>
      getProducts(limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedProducts = allPages.reduce(
        (count, page) => count + page.products.length,
        0
      );
      return loadedProducts < lastPage.total ? loadedProducts : undefined;
    },
  });
};