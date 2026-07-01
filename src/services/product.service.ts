import api from "@/lib/axios";

export const getProducts = async (limit?: number) => {
  const url = limit && limit > 0 ? `/products?limit=${limit}` : "/products";
  const res = await api.get(url);
  return res.data;
};

export const getProductById = async (id: number) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};