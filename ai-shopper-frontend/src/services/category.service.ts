import api from "../lib/axios";

/**
 * Fetch all product categories from our own backend.
 * Previously called DummyJSON directly — now served from our database.
 */
export const getCategories = async (): Promise<{ slug: string; name: string }[]> => {
  const res = await api.get("/products/categories");
  return res.data;
};

/**
 * Fetch products filtered by category slug from our own backend.
 */
export const getProductsByCategory = async (
  slug: string,
  page = 1,
  limit = 20
) => {
  const res = await api.get("/products", {
    params: { category: slug, page, limit },
  });
  const products = (res.data.data || []).map((p: any) => ({
    ...p,
    id: String(p._id || p.id),
  }));

  return {
    ...res.data,
    data: products,
    products,
    total: res.data.pagination?.total ?? products.length,
  };
};
