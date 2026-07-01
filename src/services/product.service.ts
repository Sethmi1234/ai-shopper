import api from "@/lib/axios";

export const getProducts = async (limit = 4) => {
  const res = await api.get(`/products?limit=${limit}`);
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